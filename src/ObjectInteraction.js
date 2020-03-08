import { formatMoney } from './Constants'

export class ObjectInteraction {
    constructor(object, text) {
        this.object = object;
        this.text = text;
    }
}

export class ItemPurchase extends ObjectInteraction {
    constructor(object, owner, item, price) {
        super(object, 'Buy ' + item.name + ' (' + formatMoney(price) + ')');
        this.price = price;
        this.owner = owner
        this.item = item
    }

    onInteract(character) {
        if (character.cents >= this.price) {
            character.inventory.push(this.item);
            character.cents -= this.price;
            this.owner.cents += this.price;
            this.object.delete()
        }
    }
}

export class ItemSteal extends ObjectInteraction {
    constructor(object, owner, item) {
        super(object, 'Steal ' + item.name);
        this.owner = owner
        this.item = item;
    }

    onInteract(character) {
        character.inventory.push(this.item);
        this.object.delete()
    }
}

export class CashTake extends ObjectInteraction {
    constructor(object) {
        super(object, 'Take ' + formatMoney(object.value));
    }

    onInteract(character) {
        character.cents += this.object.value;
        this.object.delete()
    }
}

export class ItemLoot extends ObjectInteraction {
    constructor(object, item) {
        super(object, 'Loot ' + item.name);
        this.item = item;
    }

    onInteract(character) {
        character.inventory.push(this.item);
        _.remove(this.object.character.inventory, this.item);
    }
}

export class MoneyLoot extends ObjectInteraction {
    constructor(object) {
        super(object, 'Loot ' + formatMoney(object.character.cents));
    }

    onInteract(character) {
        character.cents += this.object.character.cents;
        this.object.character.cents = 0;
    }
}

export class AmmoLoot extends ObjectInteraction {
    constructor(object, ammoType) {
        super(object, 'Loot ' + object.character[ammoType] + ' ' + ammoType);
        this.ammoType = ammoType;
    }

    onInteract(character) {
        character[this.ammoType] += this.object.character[this.ammoType];
        this.object.character[this.ammoType] = 0;
    }
}
