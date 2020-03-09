import { RANGE_POINT_BLANK, RANGE_CLOSE, RANGE_MEDIUM, RANGE_LONG } from "./Constants";

export class Item {
    constructor() {
        this.naturalItem = false; // a person's fist, a bear's claws, etc.
        this.isWeapon = false;
        this.name = 'item';
        this.description = 'No description.';
        this.value = 0;
        this.symbol = 'o';
    }
}

export class Weapon extends Item {
    constructor() {
        super();
        this.isWeapon = true;
        this.name = 'weapon';

        this.drawSpeed = 0;
        this.minDamage = 1;
        this.maxDamageBase = 1;
        this.maxDamageAttributes = ['strength'];
    }
}

export class CanOfBeans extends Item {
    constructor() {
        super();
        this.name = 'can of beans';
        this.description = 'Some tasty beans.';
        this.symbol = 'o';
        this.value =  50;
    }
}

export class BoxOfBullets extends Item {
    constructor() {
        super();
        this.name = '36 bullets';
        this.description = 'A box of bullets.';
        this.symbol = 'b';
        this.value =  100;
    }

    onBuy(character) {
        character.bullets += 36;
    }
}

export class BoxOfBuckshot extends Item {
    constructor() {
        super();
        this.name = '12 buckshot shells';
        this.description = 'A box of buckshot shells.';
        this.symbol = 's';
        this.value =  100;
    }

    onBuy(character) {
        character.buckshot += 12;
    }
}

export class VaultKey extends Item {
    constructor() {
        super();
        this.name = 'bank vault key';
        this.description = 'This unlocks the bank vault.';
        this.symbol = '!';
    }
}

export class MeleeWeapon extends Weapon {
    constructor() {
        super();
        this.name = 'melee weapon';
        this.description = 'A melee weapon.';

        this.isMelee = true;
        this.maximumRange = RANGE_POINT_BLANK;
    }
}

export class RangedWeapon extends Weapon {
    constructor() {
        super();
        this.name = 'ranged weapon';
        this.description = 'A ranged weapon.';

        this.isMelee = false;
        this.maximumRange = RANGE_LONG;

        this.capacity = 1;
        this.currentAmmo = 0;
        this.ammoType = 'bullets';
        this.unloadsWhenStowed = false;
        this.rangeModifiers = [];
        this.rangeModifiers[RANGE_POINT_BLANK] = 0;
        this.rangeModifiers[RANGE_CLOSE] = 0;
        this.rangeModifiers[RANGE_MEDIUM] = 0;
        this.rangeModifiers[RANGE_LONG] = 0;
    }
}

export class Fist extends MeleeWeapon {
    constructor() {
        super();
        this.name = 'fist';
        this.naturalItem = true;

        this.drawDelay = 0;
        this.minDamage = 1;
        this.maxDamageBase = 1;
        this.maxDamageAttributes = ['strength'];
    }
}

export class Knife extends MeleeWeapon {
    constructor() {
        super();
        this.name = 'knife';

        this.drawDelay = 1;
        this.minDamage = 1;
        this.maxDamageBase = 4;
        this.maxDamageAttributes = ['strength'];
        this.value =  200;
    }
}

export class Shovel extends MeleeWeapon {
    constructor() {
        super();
        this.name = 'shovel';

        this.drawDelay = 3;
        this.minDamage = 2;
        this.maxDamageBase = 3;
        this.maxDamageAttributes = ['strength'];
        this.value =  200;
    }
}

export class Axe extends MeleeWeapon {
    constructor() {
        super();
        this.name = 'axe';

        this.drawDelay = 3;
        this.minDamage = 3;
        this.maxDamageBase = 4;
        this.maxDamageAttributes = ['strength'];
        this.value =  200;
    }
}

export class Bow extends RangedWeapon {
    constructor() {
        super();
        this.name = 'bow';

        this.unloadsWhenStowed = true;

        this.drawDelay = 2;
        this.capacity = 1;
        this.ammoType = 'arrows';

        this.minDamage = 2;
        this.maxDamageBase = 0;
        this.maxDamageAttributes = ['grit', 'strength'];
        this.rangeModifiers[RANGE_POINT_BLANK] = -5;
        this.rangeModifiers[RANGE_CLOSE] = 0;
        this.rangeModifiers[RANGE_MEDIUM] = 0;
        this.rangeModifiers[RANGE_LONG] = 0;
        this.value =  200;
    }
}

export class Pistol extends RangedWeapon {
    constructor(loaded) {
        super();
        this.name = 'pistol';

        this.drawDelay = 1;
        this.capacity = 1;
        this.ammoType = 'bullets';
        if (loaded) {
            this.currentAmmo = this.capacity;
        }

        this.minDamage = 1;
        this.maxDamageBase = 4;
        this.maxDamageAttributes = ['grit'];
        this.rangeModifiers[RANGE_POINT_BLANK] = 0;
        this.rangeModifiers[RANGE_CLOSE] = 2;
        this.rangeModifiers[RANGE_MEDIUM] = 0;
        this.rangeModifiers[RANGE_LONG] = -2;
        this.value =  600;
    }
}

export class Revolver extends RangedWeapon {
    constructor(loaded) {
        super();
        this.name = 'revolver';

        this.drawDelay = 1;
        this.capacity = 6;
        this.ammoType = 'bullets';
        if (loaded) {
            this.currentAmmo = this.capacity;
        }

        this.minDamage = 1;
        this.maxDamageBase = 5;
        this.maxDamageAttributes = ['grit'];
        this.rangeModifiers[RANGE_POINT_BLANK] = 0;
        this.rangeModifiers[RANGE_CLOSE] = 2;
        this.rangeModifiers[RANGE_MEDIUM] = 0;
        this.rangeModifiers[RANGE_LONG] = -2;
        this.value =  1200;
    }
}

export class Rifle extends RangedWeapon {
    constructor(loaded) {
        super();
        this.name = 'rifle';

        this.drawDelay = 3;
        this.capacity = 1;
        this.ammoType = 'bullets'
        if (loaded) {
            this.currentAmmo = this.capacity;
        }

        this.minDamage = 2;
        this.maxDamageBase = 5;
        this.maxDamageAttributes = ['grit'];
        this.rangeModifiers[RANGE_POINT_BLANK] = -5;
        this.rangeModifiers[RANGE_CLOSE] = 0;
        this.rangeModifiers[RANGE_MEDIUM] = 2;
        this.rangeModifiers[RANGE_LONG] = 2;
        this.value =  2000;
    }
}

export class Shotgun extends RangedWeapon {
    constructor(loaded) {
        super();
        this.name = 'shotgun';

        this.drawDelay = 3;
        this.capacity = 2;
        this.ammoType = 'buckshot'
        if (loaded) {
            this.currentAmmo = this.capacity;
        }

        this.minDamage = 1;
        this.maxDamageBase = 5;
        this.maxDamageAttributes = ['grit'];
        this.rangeModifiers[RANGE_POINT_BLANK] = 0;
        this.rangeModifiers[RANGE_CLOSE] = 5;
        this.rangeModifiers[RANGE_MEDIUM] = 0;
        this.rangeModifiers[RANGE_LONG] = -5;
        this.value =  2000;
    }
}