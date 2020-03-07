import { formatMoney } from './Constants'

export class CharacterInteraction {
    constructor(character, text) {
        this.character = character;
        this.text = text;
    }
}

export class ItemSell extends CharacterInteraction {
    constructor(character, seller, item, price) {
        super(character, 'Sell ' + item.name + ' (' + formatMoney(price) + ')');
        this.price = price;
        this.seller = seller
        this.item = item
    }

    onInteract(character) {
        _.remove(character.inventory, this.item);
        character.cents += this.price;
        this.character.cents -= this.price;
        this.character.addItem(this.item);
    }
}

export class MoneyDeposit extends CharacterInteraction {
    constructor(character, value) {
        super(character, 'Deposit ' + formatMoney(value));
        this.value = value;
    }
    onInteract(character) {
        this.character.takeMoney(this.value, character);
    }
}

export class MoneyWithdrawl extends CharacterInteraction {
    constructor(character, value) {
        super(character, 'Withdraw ' + formatMoney(value));
        this.value = value;
    }
    onInteract(character) {
        this.character.giveMoney(this.value, character);
    }
}
