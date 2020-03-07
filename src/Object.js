import { ItemPurchase, ItemSteal, ItemLoot, MoneyLoot } from "./ObjectInteraction";

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
        this.price = price;
        this.owner = owner;
    }

    getInteractions() {
        return [new ItemPurchase(this, this.owner, this.item, this.price), new ItemSteal(this, this.owner, this.item)];
    }
}

export class Body extends Object {
    constructor(character) {
        super('body (' + character.name + ')', 'X', 'white')
        this.character = character;
    }

    getInteractions() {
        let interactions = []
        for (let item of this.character.inventory) {
            interactions.push(new ItemLoot(this, item));
        }
        if (this.character.cents > 0) {
            interactions.push(new MoneyLoot(this))
        }
        return interactions;
    }
}