import { ItemPurchase, ItemSteal, ItemLoot, MoneyLoot, CashTake, AmmoLoot } from "./ObjectInteraction";
import { formatMoney } from "./Constants";

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
        //disable stealing for now
        //return [new ItemPurchase(this, this.owner, this.item, this.price), new ItemSteal(this, this.owner, this.item)];
        return [new ItemPurchase(this, this.owner, this.item, this.price)];
    }
}

export class Body extends Object {
    constructor(character) {
        super('body (' + character.name + ')', '&', 'white')
        this.character = character;
        this.isBody = true;
    }

    getInteractions() {
        let interactions = []
        for (let item of this.character.inventory) {
            interactions.push(new ItemLoot(this, item));
        }
        if (this.character.cents > 0) {
            interactions.push(new MoneyLoot(this))
        }
        if (this.character.bullets > 0) {
            interactions.push(new AmmoLoot(this, 'bullets'))
        }
        if (this.character.arrows > 0) {
            interactions.push(new AmmoLoot(this, 'arrows'))
        }
        if (this.character.buckshot > 0) {
            interactions.push(new AmmoLoot(this, 'buckshot'))
        }

        return interactions;
    }
}

export class Cash extends Object {
    constructor(value) {
        // To do: replace with formatMoney
        super('Cash (' + value.toString() + ')', '$', 'green');
        this.value = value;
    }

    getInteractions() {
        return [new CashTake(this)];
    }
}

