import { ItemPurchase, ItemSteal } from "./ObjectInteraction";

export class Object {
    constructor(name, symbol, color) {
        this.name = name;
        this.symbol = symbol;
        this.color = color;
    }

    getDisplayChar() {
        return {
            symbol: this.symbol,
            color: this.color
        };
    }

    delete() {
        _.remove(this.game.objects, this);
    }
}

export class ShopItem extends Object {
    constructor(item, price, owner) {
        super(item.name, item.symbol, 'white')
        this.item = item;
        this.interactions = [new ItemPurchase(this, owner, item, price), new ItemSteal(this, owner, item)];
    }
}
