import { Component } from 'react';
import * as ReactDOM from 'react-dom';

function copyStyles(src, dest) {
  Array.from(src.styleSheets).forEach((styleSheet) => {
    const styleElement = styleSheet.ownerNode.cloneNode(true);
    styleElement.href = styleSheet.href;
    dest.head.appendChild(styleElement);
  });
  Array.from(src.fonts).forEach((font) => dest.fonts.add(font));
}

export default class AutoParticleLocatorWindow extends Component {
  containerEl = document.createElement('div');

  externalWindow = null;

  ///todo
  f = this.props.handleDidChange;

  componentDidMount() {
    this.externalWindow = window.open('', 'AutoParticleLocatorWindow');
    copyStyles(window.document, this.externalWindow.document);

    if (this.externalWindow) {
      this.containerEl.className = 'text-center';
      this.externalWindow.document.body.appendChild(this.containerEl);
      this.externalWindow.onunload = () => this.props.onClose();
    }
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.containerEl);
  }
}
