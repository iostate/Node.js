let Rectangle = class {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
  getHeight() {
    return this.height;
  }
  getWidth() {
    return this.width;
  }
  setHeight(height) {
    this.height = height;
  }
  setWeight(weight) {
    this.weight = weight;
  }
  toString() {
    return `${this.name}: height = ${this.height}, width = ${this.width}`;
  }
};
Rectangle.prototype.setHeightt = (number) => {
  Rectangle.prototype.height = number;
};

let cuero = new Rectangle(3, 4);

cuero.setHeightt(17);
console.log(Rectangle.prototype);
