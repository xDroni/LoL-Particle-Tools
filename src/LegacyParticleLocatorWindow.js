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

export default class LegacyParticleLocatorWindow extends Component {
  containerEl = document.createElement('div');

  externalWindow = null;

  listener = (event) => {
    if (event.code === 'KeyY') {
      return this.props.handleDidChangeClick(true);
    }
    if (event.code === 'KeyN') {
      return this.props.handleDidChangeClick(false);
    }
  };

  componentDidMount() {
    this.externalWindow = window.open('', 'LegacyParticleLocatorWindow');
    copyStyles(window.document, this.externalWindow.document);

    if (this.externalWindow) {
      this.containerEl.className = 'text-center';
      this.externalWindow.document.addEventListener('keydown', this.listener);
      this.externalWindow.document.body.appendChild(this.containerEl);
      this.externalWindow.onunload = () => this.props.onClose();
    }
  }

  componentWillUnmount() {
    this.externalWindow.document.removeEventListener('keydown', this.listener);
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.containerEl);
  }
}
