import { COMPOSER_INPUT_SELECTOR } from '@dsh-claude-style/contracts/dom'

/**
 * Composer caret preservation for the features that move the focus themselves.
 *
 * The composer is a Lexical contenteditable, and its DOM selection is the
 * reader's caret. A bare `focus()` re-homes that selection: the caret lands at
 * the start of the draft, and Lexical's own stored selection is not restored
 * by it. Two features take the focus away and hand it back — the inline card's
 * press (composer.ts) and the process fold's programmatic header toggle
 * (chat-fold/process-fold.ts) — so both carry the range across the focus.
 */

/**
 * The composer's live caret or selection.
 * @param doc - document to read; the plugin's own document by default.
 * @returns a copy of the range while the composer holds the selection, else null.
 */
export function captureComposerCaret(doc: Document = document): Range | null {
  try {
    const composer = doc.querySelector(COMPOSER_INPUT_SELECTOR)
    if (composer === null) return null
    const selection = doc.getSelection()
    if (selection === null || selection.rangeCount === 0) return null
    const range = selection.getRangeAt(0)
    if (range.startContainer !== composer && !composer.contains(range.startContainer)) return null
    return range.cloneRange()
  } catch {
    return null
  }
}

/**
 * Focus `el` and put a composer caret back afterwards.
 *
 * The restore is best-effort: Lexical adopts the restored DOM selection on its
 * next selection read, and a host that has already focused the composer is
 * left to its own (Lexical-aware) restore instead.
 * @param el - element to focus.
 * @param caret - range from {@link captureComposerCaret}, or null when the
 *   composer held no selection when the focus was taken away.
 */
export function focusKeepingComposerCaret(el: HTMLElement, caret: Range | null): void {
  try {
    el.focus({ preventScroll: true })
  } catch {
    el.focus()
  }
  if (caret === null) return
  try {
    const selection = el.ownerDocument.getSelection()
    if (selection === null) return
    selection.removeAllRanges()
    selection.addRange(caret)
  } catch {
    // The caret is a convenience; the focus above is what the caller asked for.
  }
}
