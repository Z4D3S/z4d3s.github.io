import foxArt from '../assets/fox-ascii.txt?raw';

const FOX_LINES = foxArt.replace(/\r/g, '').split('\n');
const BOOT_KEY = 'z4des:fox-booted';

export type FoxVariant = 'boot' | 'theme' | 'article';

export function motionDisabled(): boolean {
  const root = document.documentElement;
  return (
    root.classList.contains('motion-off') ||
    (!root.classList.contains('motion-on') &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  );
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function foxMarkup(): string {
  return FOX_LINES.map(
    (line, index) =>
      `<span class="shell-fox__line" style="--i:${index}">${escapeHtml(line || ' ')}</span>`,
  ).join('');
}

export function appendShellFox(shell: HTMLElement, variant: FoxVariant, label = 'fox.ascii') {
  const wrap = document.createElement('div');
  wrap.className = `shell-fox shell-fox--${variant}`;
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = `
    <span class="shell-fox__label">${label}</span>
    <pre class="shell-fox__art">${foxMarkup()}</pre>
  `;
  shell.append(wrap);
}

function typeCommand(shell: HTMLElement, command: string, speed: number) {
  const target = shell.querySelector<HTMLElement>('[data-cmd]');
  let index = 0;

  const timer = window.setInterval(() => {
    index += 1;
    if (target) target.textContent = command.slice(0, index);
    if (index >= command.length) window.clearInterval(timer);
  }, speed);
}

function closeShell(shell: HTMLElement, delay: number) {
  window.setTimeout(() => {
    let removed = false;
    const cleanup = () => {
      if (removed) return;
      removed = true;
      shell.remove();
    };

    shell.classList.add('is-closing');

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== shell) return;
      shell.removeEventListener('transitionend', onTransitionEnd);
      cleanup();
    };

    shell.addEventListener('transitionend', onTransitionEnd);
    // Fallback for hidden windows, where transitions may not advance.
    window.setTimeout(cleanup, 600);
  }, delay);
}

/**
 * One-time boot sequence per browsing session. The fox powers on like a CRT
 * and the shell lifts to reveal the page.
 */
export function bootFox(): boolean {
  if (motionDisabled()) return false;

  try {
    if (window.sessionStorage.getItem(BOOT_KEY)) return false;
    window.sessionStorage.setItem(BOOT_KEY, '1');
  } catch {
    // If storage is blocked, skip the boot to avoid repeating it on every page.
    return false;
  }

  const shell = document.createElement('div');
  shell.className = 'theme-shell theme-shell--boot';
  shell.setAttribute('aria-hidden', 'true');
  shell.innerHTML = `
    <div class="theme-shell__bar">
      <span>z4des@blog</span>
      <span>inicio de sesión</span>
    </div>
    <div class="theme-shell__body">
      <p class="theme-shell__prompt">
        <span class="theme-shell__user">z4des@blog</span><span class="theme-shell__path">:~$</span>
        <span data-cmd></span><span class="theme-shell__caret">_</span>
      </p>
      <p class="theme-shell__out" data-delay="1">
        <span class="theme-shell__ok">[ ok ]</span> guardián ASCII en línea
      </p>
      <p class="theme-shell__out" data-delay="2">
        <span class="theme-shell__ok">[ ok ]</span> bienvenido a z4des
      </p>
    </div>
  `;

  appendShellFox(shell, 'boot', 'fox.init');
  document.body.append(shell);

  typeCommand(shell, './fox --init', 26);
  closeShell(shell, 1500);
  return true;
}

/** Article arrival: the fox slides in from the edge while the post is typed out. */
export function openArticleShell(slug: string) {
  if (motionDisabled()) return;

  const shell = document.createElement('div');
  shell.className = 'theme-shell theme-shell--article';
  shell.setAttribute('aria-hidden', 'true');
  shell.innerHTML = `
    <div class="theme-shell__bar">
      <span>z4des@blog</span>
      <span>article view</span>
    </div>
    <div class="theme-shell__body">
      <p class="theme-shell__prompt">
        <span class="theme-shell__user">z4des@blog</span><span class="theme-shell__path">:~$</span>
        <span data-cmd></span><span class="theme-shell__caret">_</span>
      </p>
      <p class="theme-shell__out" data-delay="1">
        <span class="theme-shell__ok">[ ok ]</span> artículo cargado
      </p>
      <p class="theme-shell__out" data-delay="2">
        <span class="theme-shell__ok">[ ok ]</span> markdown renderizado
      </p>
    </div>
  `;

  appendShellFox(shell, 'article');
  document.body.append(shell);

  typeCommand(shell, `cat ${slug}.md`, 22);
  closeShell(shell, 820);
}
