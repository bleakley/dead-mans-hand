import { MALE_NAMES, LAST_NAMES, RANGE_POINT_BLANK, RANGE_CLOSE, RANGE_MEDIUM, RANGE_LONG, RANGES, XP_REQUIREMENTS } from "./Constants";
import { Fist, Revolver, Knife, CanOfBeans, Shotgun, Bow } from "./Item";
import { Body, ShopItem } from "./Object";
import { ItemSell } from "./CharacterInteraction";

export class Character {
    constructor(level, strength, quickness, cunning, guile, grit) {
        this.name = 'Stranger';
        this.symbol = '@';
        this.color = 'white';
        this.isPC = false;
        this.isNPC = true;

        this.cents = 0;
        this.bullets = 0;
        this.buckshot = 0;
        this.arrows = 0;
        this.inventory = [];
        this.equippedWeapon = null;
        this.naturalWeapon = new Fist();
        this.initiative = 0;

        this.level = level;
        this.xp = 0;

        this.strength = strength;
        this.quickness = quickness;
        this.cunning = cunning;
        this.guile = guile;
        this.grit = grit;

        this.health = this.getMaxHealth();
        this.vigilance = this.getMaxVigilance();
        this.subterfuge = this.getMaxSubterfuge();

        this.honor = 0;
        this.menace = 0;
        this.luck = 0;

        this.threat = 0;
        this.opinionOfPC = 0;

        this.utterance = '';
        this.activePokerPlayerRole = null;
    }

    getDisplayChar() {
        return {
            symbol: this.symbol,
            color: 'white'
        };
    }

    getMaxHealth() {
        return 10 + this.level + this.strength + this.grit;
    }

    getMaxVigilance() {
        return 5 + this.quickness + this.cunning;
    }

    getMaxSubterfuge() {
        return this.guile + this.quickness + this.cunning;
    }

    getMeleeAttack() {
        return this.level + this.quickness + this.strength;
    }

    getRangedAttack() {
        return this.level + this.quickness + this.grit;
    }

    getDefense() {
        return 10 + Math.floor(this.level / 2) + this.grit;
    }

    startTurn() {
        this.utterance = '';
    }

    takeTurn() {
        this.startTurn();

        /*
        Desires
        gambling
        travel
        */

        if (this.canReload() && !this.getCurrentWeapon().currentAmmo) {
            this.reload();
        }

        let pokerPlayerRole = this.activePokerPlayerRole;
        if (pokerPlayerRole && pokerPlayerRole.isActivePlayer() && pokerPlayerRole.game.waitingForActivePlayerAction) {
            pokerPlayerRole.play();
            pokerPlayerRole.game.activePlayer = pokerPlayerRole.game.getNextPlayer(pokerPlayerRole, true);
            return;
        }

        if (pokerPlayerRole && pokerPlayerRole.isDealer() && pokerPlayerRole.game.waitingForDealerAction) {
            pokerPlayerRole.deal();
            return;
        }

        this.wait();
    }

    join(pokerGame) {
        if (this.isNPC) {
            this.say(`I'm joining this game.`);
        }
        let p = pokerGame.addPlayer(this);
        this.activePokerPlayerRole = p;
    }

    say(utterance) {
        this.utterance = utterance;
    }

    wait() {
        if (this.vigilance < this.getMaxVigilance()) {
            this.vigilance++;
        }

        if (_.random(1, 100) < 20 && this.isNPC && this.activePokerPlayerRole && this.activePokerPlayerRole.game.activePlayer && this.activePokerPlayerRole.game.activePlayer.character.isPC) {
            this.say(_.sample(['Your go.', 'Waiting on you.', `${this.activePokerPlayerRole.game.activePlayer.character.name}?`]));
        } else if (_.random(1, 100) < 4) {
            this.say(_.sample(['*whistle*', '*cough*']));
        }
    }

    equip(weapon) {
        if (this.equippedWeapon && this.equippedWeapon.unloadsWhenStowed) {
            this[this.equippedWeapon.ammoType] += this.equippedWeapon.currentAmmo;
            this.equippedWeapon.currentAmmo = 0;
        }
        this.equippedWeapon = weapon;
        this.initiative -= weapon.drawDelay;
    }

    unequip() {
        if (this.equippedWeapon.unloadsWhenStowed) {
            this[this.equippedWeapon.ammoType] += this.equippedWeapon.currentAmmo;
            this.equippedWeapon.currentAmmo = 0;
        }
        this.equippedWeapon = null;
    }

    reload() {
        let weapon = this.getCurrentWeapon();
        weapon.currentAmmo++;
        this[weapon.ammoType]--;
    }

    getCurrentWeapon() {
        return this.equippedWeapon || this.naturalWeapon;
    }

    canReload() {
        let weapon = this.getCurrentWeapon();
        return weapon.capacity && weapon.currentAmmo < weapon.capacity && this[weapon.ammoType] > 0;
    }

    getDamageWithWeapon(weapon) {
        let min = weapon.minDamage;
        let max = weapon.maxDamageAttributes.reduce((prev, curr) => prev + this[curr], weapon.maxDamageBase);
        max = Math.max(min, max);
        return { min, max };
    }

    canAttack(target) {
        let weapon = this.getCurrentWeapon();
        let distance = this.distanceBetween(target);
        let range = [RANGE_POINT_BLANK, RANGE_CLOSE, RANGE_MEDIUM, RANGE_LONG].find(r => distance >= RANGES[r].min && distance <= RANGES[r].max);
        if (range > weapon.maximumRange) {
            return false;
        }

        if (weapon.capacity && weapon.currentAmmo < 1) {
            return false;
        }

        return true;
    }

    attack(target) {
        let weapon = this.getCurrentWeapon();
        let distance = this.distanceBetween(target);
        let range = [RANGE_POINT_BLANK, RANGE_CLOSE, RANGE_MEDIUM, RANGE_LONG].find(r => distance >= RANGES[r].min && distance <= RANGES[r].max);

        let rangeBonus = weapon.rangeModifiers[range];

        let attackBonus = weapon.isMelee ? this.getMeleeAttack() : (this.getRangedAttack() + rangeBonus);
        let attackRoll = _.random(1, 20);
        let total = attackBonus + attackRoll;
        let ac = target.getDefense();
        let hit = total >= ac;

        weapon.currentAmmo--;
        this.onAttack(target);

        if (weapon.ammoType) {
            this.game.addProjectile(weapon.ammoType, hit, { x: this.x, y: this.y }, { x: target.x, y: target.y });
        }

        if (!hit) {
            this.game.log(`${this.name} attacks ${target.name} with his ${weapon.name}. [${attackRoll}] + ${attackBonus} vs ${ac} and misses.`);
            return;
        }

        let { min, max } = this.getDamageWithWeapon(weapon);
        let damageRoll = _.random(min, max) + rangeBonus;
        let targetKilled = target.takeDamage(damageRoll);
        if (targetKilled) {
            this.game.log(`${this.name} hits ${target.name} with his ${weapon.name}, dealing ${damageRoll} damage and killing him.`);
            this.onKill(target);
        } else {
            this.game.log(`${this.name} hits ${target.name} with his ${weapon.name}, dealing ${damageRoll} damage.`);
        }

    }

    takeDamage(damage) {
        this.health = Math.max(this.health - damage, 0);
        this.vigilance = Math.max(this.vigilance - damage, 0);

        if (this.health <= 0) {
            this.die();
            return true;
        }
        return false;
    }

    die() {
        if (this.activePokerPlayerRole) {
            this.activePokerPlayerRole.game.removePlayer(this.activePokerPlayerRole);
        }
        _.remove(this.game.characters, this);
        this.game.addObject(new Body(this), this.x, this.y);
    }

    distanceBetween(other) {
        return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
    }

    getAdjacentObjects() {
        let objects = [];
        objects = objects.concat(this.game.getObjects(this.x + 1, this.y))
        objects = objects.concat(this.game.getObjects(this.x - 1, this.y))
        objects = objects.concat(this.game.getObjects(this.x, this.y + 1))
        objects = objects.concat(this.game.getObjects(this.x, this.y - 1))
        return objects;
    }

    getAdjacentCharacters() {
        let characters = [];
        characters = characters.concat(this.game.getCharacters(this.x + 1, this.y))
        characters = characters.concat(this.game.getCharacters(this.x - 1, this.y))
        characters = characters.concat(this.game.getCharacters(this.x, this.y + 1))
        characters = characters.concat(this.game.getCharacters(this.x, this.y - 1))
        return characters;
    }

    getAllowedInteractions() {
        let interactions = [];
        for (let object of this.getAdjacentObjects()) {
            interactions = interactions.concat(object.getInteractions());
        }
        for (let character of this.getAdjacentCharacters()) {
            interactions = interactions.concat(character.getInteractions(this));
        }
        return interactions;
    }

    getInteractions(character) {
        return [];
    }
}

export class PlayerCharacter extends Character {
    constructor() {
        super(0, 0, 0, 0, 0, 0);
        this.name = 'Rodney';
        this.cents = 2000;
        this.isPC = true;
        this.isNPC = false;
        this.bullets = 50;
        this.buckshot = 20;
        this.arrows = 20;

        this.inventory.push(new Revolver(true));
        this.inventory.push(new Knife());
        this.inventory.push(new CanOfBeans());
        this.inventory.push(new Shotgun(true));
        this.inventory.push(new Bow());
    }

    gainXp(xp) {
        this.xp += xp;
        if (this.level < 20 && this.xp >= XP_REQUIREMENTS[this.level + 1]) {
            // TODO: make this a choice
            let attributeToImprove = _.sample(['strength', 'quickness', 'cunning', 'guile', 'grit']);
            this.level++;
            this[attributeToImprove]++;
            this.game.log(`You have gained a level and improved your ${attributeToImprove}.`);
        }
    }

    onWinHand() {
        this.gainXp(3);
    }

    onLoseHand() {
    }

    onAttack(target) {
    }

    onKill(target) {
        this.gainXp(5);
    }
}

export class NonPlayerCharacter extends Character {
    constructor(level, strength, quickness, cunning, guile, grit) {
        super(level, strength, quickness, cunning, guile, grit);

        this.desires = {
            gamble: 0,
            travel: 0
        };
        this.winningStreak = 0;
        this.losingStreak = 0;
    }
}


export class Scoundrel extends NonPlayerCharacter {
    constructor() {
        super(
            _.sample([0, 0, 1, 2]), // Level
            _.sample([0, 1, 1, 2]), // Strength
            _.sample([0, 1, 2, 2]), // Quickness
            _.sample([0, 0, 0, 1]), // Cunning
            _.sample([0, 1, 2, 3]), // Guile
            _.sample([0, 0, 1, 2]), // Grit
        );
        this.name = `${_.sample(MALE_NAMES)} ${_.sample(LAST_NAMES)}`;
        this.symbol = '@';

        this.cents = 2000;

    }

    onWinHand() {
        this.winningStreak++;
        this.losingStreak = 0;
        this.desires.gamble++;
        if (this.winningStreak > 1) {
            this.desires.travel++;
        }
    }

    onLoseHand() {
        this.losingStreak++;
        this.winningStreak = 0;
        this.desires.travel++;
    }

    onAttack(target) {
    }

    onKill(target) {
    }
}

export class Priest extends NonPlayerCharacter {
    constructor() {
        super(
            _.sample([0, 1, 2, 4]), // Level
            _.sample([0, 1, 1, 2]), // Strength
            _.sample([0, 1, 2, 2]), // Quickness
            _.sample([0, 0, 0, 1]), // Cunning
            _.sample([0, 1, 2, 3]), // Guile
            _.sample([0, 1, 2, 3]), // Grit
        );
        this.name = `${_.sample(MALE_NAMES)} ${_.sample(LAST_NAMES)}`;
        this.symbol = '@';

        this.cents = 2000;

    }
}

export class ShopKeep extends NonPlayerCharacter {
    constructor(top, left, width, height) {
        super(
            _.sample([0, 0, 1, 2]), // Level
            _.sample([0, 1, 1, 2]), // Strength
            _.sample([0, 0, 1, 2]), // Quickness
            _.sample([0, 0, 0, 1]), // Cunning
            _.sample([0, 0, 0, 1]), // Guile
            _.sample([0, 0, 0, 1]), // Grit
        );
        this.name = `${_.sample(MALE_NAMES)} ${_.sample(LAST_NAMES)}`;
        this.symbol = '@';
        this.inventory.push(new Revolver(true));
        this.shopTop = top;
        this.shopLeft = left;
        this.shopWidth = width;
        this.shopHeight = height;
        this.cents = 8000;

    }

    getInteractions (character) {
        let interactions = [];
        if (this.getEmptyShopSpace()) {
            for (let item of character.inventory) {
                if (item.value > 0) {
                    interactions.push(new ItemSell(this, character, item, item.value));    
                }
            }
        }
        return interactions;
    }

    addItem(item) {
        let space = this.getEmptyShopSpace();
        this.game.addObject(new ShopItem(item, item.value, this), space[0], space[1]);
    }

    getEmptyShopSpace() {
        let spaces = [];
        for (let x = this.shopLeft + 1; x < this.shopLeft + this.shopWidth; x++) {
            for (let y = this.shopTop + 3; y < this.shopTop + this.shopHeight; y += 2) {
                if (x != this.shopLeft + this.shopWidth/2) {
                    if (this.game.spaceIsPassable(x, y)) {
                        spaces.push([x, y]);
                    }
                }
            }
        }        

        if (spaces.length > 0) {
            return _.sample(spaces);
        }
        else {
            return null;
        }
    }
}
