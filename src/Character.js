import { MALE_NAMES, LAST_NAMES, RANGE_POINT_BLANK, RANGE_CLOSE, RANGE_MEDIUM, RANGE_LONG } from "./Constants";
import { Fist, Revolver, Knife, CanOfBeans, Shotgun, Bow } from "./Item";

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
        return Math.floor(this.level / 2) + this.grit;
    }

    startTurn() {
        this.utterance = '';
    }

    takeTurn() {
        this.startTurn();
        this.wait();
    }

    join(pokerGame) {
        this.say(`I'm joining this game.`);
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
        this.say(_.sample(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '*whistle*', '*cough*']));
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

    attack(target) {
        let weapon = getCurrentWeapon();
        let distance = this.distanceBetween(target);
        let range = [RANGE_POINT_BLANK, RANGE_CLOSE, RANGE_MEDIUM, RANGE_LONG].find(r => distance >= r.min && distance <= r.max);
        if (range > weapon.maximumRange) {
            console.log('out of range');
            return false;
        }

        let attackBonus = (weapon.isMelee ? this.getMeleeAttack() : this.getRangedAttack()) + weapon.rangeModifiers[range];
        let attackRoll = _.random(1, 20);
        let total = attackBonus + attackRoll;
        let ac = target.getDefense();
        let hit = total >= ac;
        console.log(`${this.name} attacks ${target.name} with his ${weapon.name}. [${attackRoll}] + ${attackBonus} vs ${ac} : ${hit ? 'Hit' : 'Miss'}!`);
    }

    distanceBetween(other) {
        return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
    }

}

export class PlayerCharacter extends Character {
    constructor() {
        super(0, 0, 0, 0, 0, 0);
        this.name = 'Rodney';
        this.cents = 200;
        this.isPC = true;
        this.isNPC = false;
        this.bullets = 50;
        this.buckshot = 20;
        this.arrows = 20;

        this.inventory.push(new Revolver());
        this.inventory.push(new Knife());
        this.inventory.push(new CanOfBeans());
        this.inventory.push(new Shotgun());
        this.inventory.push(new Bow());
    }
}


export class Scoundrel extends Character {
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

        this.cents = _.random(10, 2000);

    }
}