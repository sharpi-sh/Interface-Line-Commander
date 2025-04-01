export class Modal {
  constructor(container) {
    this.container = container;
  }

  show(title, description = '', buttonText = 'Dismiss') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const titleText = document.createElement('h1');
    titleText.className = 'modal-text';
    titleText.textContent = title;
    overlay.appendChild(titleText);

    if (description) {
      const descText = document.createElement('p');
      descText.className = 'modal-description';
      descText.textContent = description;
      overlay.appendChild(descText);
    }
    
    const dismissButton = document.createElement('button');
    dismissButton.className = 'modal-button';
    dismissButton.textContent = buttonText;
    dismissButton.onclick = () => overlay.remove();
    overlay.appendChild(dismissButton);
    
    this.container.appendChild(overlay);
  }
}