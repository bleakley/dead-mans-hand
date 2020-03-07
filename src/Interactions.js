export class Interaction {
    constructor(character, text) {
        this.target = character;
        this.text = text;
    }
}

export class ItemPurchase extends Interaction {
    constructor(object, owner, item, price) {
        super(object, 'Purchase ' + item.name + ' ($' + price + ')');
        this.price = price;
        this.owner = owner
    }

    onInteract(character) {
        if (character.cents >= this.price) {
            character.inventory.push(item);
            character.cents -= this.price;
            this.token.die()
        }
    }
}
