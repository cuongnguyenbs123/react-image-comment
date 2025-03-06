class DraggableComponent {
    private element: HTMLElement | null = null;
    private newX: number = 0;
    private newY: number = 0;
    private startX: number = 0;
    private startY: number = 0;

    private mouseMoveHandler: (e: MouseEvent) => void = () => {};
    private mouseUpHandler: () => void  = () => {};
    private mouseDownHandler: (e: MouseEvent) => void  = () => {};

    constructor(id: string) {
        setTimeout(() => {
            const el = document.getElementById(id);
            if (!el) {
                throw new Error(`Element with id "${id}" not found.`);
            }
            this.element = el;

            // Giữ nguyên tham chiếu của các sự kiện
            this.mouseMoveHandler = this.mouseMove.bind(this);
            this.mouseUpHandler = this.mouseUp.bind(this);
            this.mouseDownHandler = this.mouseDown.bind(this);
            this.init();
        }, 0);
    }

    private init(): void {
        if (!this.element) return;
        this.element.addEventListener("mousedown", this.mouseDownHandler);
    }

    private mouseDown(e: MouseEvent): void {
        if (!this.element) return;
        e.preventDefault();
        if (this.element.classList.contains("dragging")) return; // Nếu đã có draggable, không khởi tạo lại

        this.element.classList.add("dragging");
        this.startX = e.clientX;
        this.startY = e.clientY;

        this.element.addEventListener("mousemove", this.mouseMoveHandler);
        this.element.addEventListener("mouseup", this.mouseUpHandler);
    }

    private mouseMove(e: MouseEvent): void {
        if (!this.element) return;
        this.newX = this.startX - e.clientX;
        this.newY = this.startY - e.clientY;

        this.startX = e.clientX;
        this.startY = e.clientY;

        this.element.style.top = `${this.element.offsetTop - this.newY}px`;
        this.element.style.left = `${this.element.offsetLeft - this.newX}px`;
    }

    private mouseUp(): void {
        if (!this.element) return;
        this.element.removeEventListener("mousemove", this.mouseMoveHandler);
        this.element.removeEventListener("mouseup", this.mouseUpHandler);
        this.element.classList.remove("dragging");
    }

    public destroy(): void {
        if (!this.element) return;
        this.element.removeEventListener("mousedown", this.mouseDownHandler);
        this.mouseUp();
    }
}

export default DraggableComponent;
