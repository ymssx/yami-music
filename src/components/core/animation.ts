export class Animation {
  el!: HTMLElement;

  constructor(el: HTMLElement) {
    this.el = el;
  }

  set(styles: { [key: string]: string }, delay: number | string = 0) {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        if (delay === 0) {
          this.el.style.transition = 'none';
        } else {
          this.el.style.transition = typeof delay === 'number' ? `all ${delay}ms` : delay;
        }
        const animationCallback = () => {
          resolve();
        };
        if (delay) {
          this.el.addEventListener('transitionend', animationCallback);
        } else {
          animationCallback();
        }
        for (const key in styles) {
          this.el.style.setProperty(key, styles[key]);
        }
      }, 10);
    });
  }
}

export function getAnimation(el: HTMLElement) {
  return new Animation(el);
}