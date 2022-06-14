import {Component} from "react";
import * as ReactDOM from 'react-dom';

function copyStyles(src, dest) {
  Array.from(src.styleSheets).forEach(styleSheet => {
    dest.head.appendChild(styleSheet.ownerNode.cloneNode(true))
  })
  Array.from(src.fonts).forEach(font => dest.fonts.add(font))
}

export default class NewWindowComponent extends Component {
  containerEl = document.createElement('div')

  externalWindow = null;

  componentDidMount() {
    this.externalWindow = window.open('', 'NewWindowComponent');
    copyStyles(window.document, this.externalWindow.document);

    if (this.externalWindow)
    {
      this.containerEl.className = 'text-center';
      this.externalWindow.document.body.appendChild(this.containerEl);
      this.externalWindow.onunload = () => this.props.onClose();
    }
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.containerEl);
  }
}
