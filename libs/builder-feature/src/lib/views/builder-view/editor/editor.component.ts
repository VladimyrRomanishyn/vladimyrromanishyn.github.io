import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { nodeList } from '@libs/builder-feature/src/lib/views/builder-view/editor/nodeList';
import { filter, first, interval, map, Subject, take, takeUntil } from 'rxjs';

interface MenuStyles {
  left: string,
  top: string,
  opacity: number;
}

enum ContextMenuEnum {
  addNode = 'addNode',
  deleteNode = 'deleteNode',
  addDiv = 'addDiv',
  cloneNode = 'cloneNode'
}

@Component({
  selector: 'pets-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild('nodeSearch') nodeSearchInput: ElementRef | undefined;
  @ViewChild('editor', { static: true }) editor: ElementRef | undefined;
  @ViewChild('contextPanel', { static: true })
  public contextPanel!: ElementRef;
  public contextMenuStyles: MenuStyles = { left: '', top: '', opacity: 0 };
  public relevantNodes: string[] = [];
  private fullNodeList: string[] = nodeList;
  public nodeSearch$: Subject<string> = new Subject<string>();
  private destroy$: Subject<void> = new Subject<void>();
  public modal: boolean = false;
  set ctxTargetElement(target: HTMLElement | undefined) {
    if (target && target?.parentElement?.localName !== 'pets-editor') {
      this._ctxTargetElement = target;
    }
  }
  get ctxTargetElement(): HTMLElement | undefined {
    return this._ctxTargetElement;
  }
  set clickTargetElement(target: HTMLElement | undefined) {
    if (target && target?.parentElement?.localName !== 'pets-editor') {
      this._clickTargetElement = target;
    }
  }
  get clickTargetElement(): HTMLElement | undefined {
    return this._clickTargetElement;
  }
  public _ctxTargetElement: HTMLElement | undefined;
  public _clickTargetElement: HTMLElement | undefined;
  public contextMenuEnum = ContextMenuEnum;
  public dragdrop = false;
  @Output() changes: EventEmitter<string> = new EventEmitter<string>();


  constructor() {
  }

  ngOnInit() {
    this.nodeSearch$.asObservable()
      .pipe(
        map((substr: string) =>
          this.fullNodeList.filter(v => v.includes(substr))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((result: string[]) => this.relevantNodes = result);
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  contextEvent(event?: PointerEvent | undefined): void {
    this.contextMenuStyles.opacity = 0;
    this.contextMenuStyles.left = '';
    this.contextMenuStyles.top = '';

    if (event) {
      const { width: panelWidth, height: panelHeight }
        = this.contextPanel.nativeElement.getBoundingClientRect();
      const { width: bodyWidth, height: bodyHeight }
        = document.body.getBoundingClientRect();

      const x = bodyWidth - event.x + 2 >= panelWidth ? event.x + 2 : bodyWidth - panelWidth;
      const y = bodyHeight - event.y >= panelHeight ? event.y : bodyHeight - panelHeight;
      this.contextMenuStyles.opacity = 1;
      this.contextMenuStyles.left = `${x}px`;
      this.contextMenuStyles.top = `${y}px`;
    }
  }

  ctxActionHandler(action: string): void {
    this.contextEvent();
    switch (action) {
      case ContextMenuEnum.addNode:
        this.addNodeModal();
        return;

      case ContextMenuEnum.deleteNode:
        this.deleteNode();
        return;

      case ContextMenuEnum.addDiv:
        this.createNode('div', this.ctxTargetElement);
        return;

      case ContextMenuEnum.cloneNode:
        this.cloneNode(this.ctxTargetElement as HTMLElement);
        return;
    }
  }

  private cloneNode(node: HTMLElement): void {
    if (node.className === 'editor') return;

    const clone = node.cloneNode(true);
    node.after(clone);
  }

  private deleteNode(): void {
    if ((this.ctxTargetElement as HTMLElement)?.parentElement?.localName === 'pets-editor') {
      return;
    }
    (this.ctxTargetElement as HTMLElement)?.remove();
    this.changes.emit(this.editor?.nativeElement.innerHTML);
  }

  private addNodeModal(): void {
    this.modal = true;
    interval(100)
      .pipe(
        take(30),
        filter(() => this.nodeSearchInput?.nativeElement),
        first()
      )
      .subscribe(() => {
        this.nodeSearchInput?.nativeElement.select();
        this.nodeSearchInput?.nativeElement.focus();
      });
  }

  createNode(node: string, target: EventTarget | undefined | null) {
    this.closeNodeModal();
    if (!target) {
      return;
    }

    const newNode: HTMLElement = document.createElement(node);
    newNode.classList.add('editor__child');
    newNode.draggable = true;
    newNode.addEventListener('drop', (event) => {console.log(event)});
    (target as HTMLElement).append(newNode);
    this.changes.emit(this.editor?.nativeElement.innerHTML);
  }

  closeNodeModal(): void {
    this.relevantNodes = [];
    this.modal = false;
  }

  hoverNode(event: any, up?: boolean): void {
    if (!this.relevantNodes.length) {return; }

    const items = [...event.querySelector('.tags-modal__results')?.children];
    const selected = items?.find(i => i.className.includes('hover'));

    if (selected) {
      const direction = up ? 'previousElementSibling' : 'nextElementSibling';
      const defaultIndex = up ? items.length - 1 : 0;

      selected.classList.remove('hover');
      selected[direction]
        ? selected[direction].classList.add('hover')
        : items[defaultIndex].classList.add('hover');

      return;
    }
    items[0].classList.add('hover')
  }

  selectNode(event: any): void {
    if (!this.relevantNodes.length) {return; }

    const items = [...event.querySelector('.tags-modal__results')?.children];
    const selected = items?.find(i => i.className.includes('hover'));

    if (selected) {
      this.createNode(selected.innerText, this.ctxTargetElement);
    }
  }
}
