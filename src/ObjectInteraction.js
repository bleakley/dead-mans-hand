export class ObjectInteraction {
    constructor(object, text) {
        this.object = object;
        this.text = text;
    }
}

export class ItemPurchase extends ObjectInteraction {
    constructor(object, owner, item, price) {
        super(object, 'Purchase ' + item.name + ' ($' + price + ')');
        this.price = price;
        this.owner = owner
    }

    onInteract(character) {
        if (character.cents >= this.price) {
            character.inventory.push(item);
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
    }

    onInteract(character) {
        character.inventory.push(item);
        this.object.delete()
    }
}
