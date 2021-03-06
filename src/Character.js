import { MALE_NAMES, LAST_NAMES, LAKOTA_MALE_NAMES, RANGE_POINT_BLANK, RANGE_CLOSE, RANGE_MEDIUM, RANGE_LONG, RANGES, XP_REQUIREMENTS, MAX_PATHFINDING_RADIUS, TILE_GRAVE } from "./Constants";
import { Fist, Revolver, Axe, Pistol, Bow, Knife, CanOfBeans, Shotgun, VaultKey, Rifle, Shovel, BoxOfBuckshot, BoxOfBullets } from "./Item";
import { Body, ShopItem, Cash } from "./Object";
import { ItemSell, MoneyWithdrawl, MoneyDeposit, Heal } from "./CharacterInteraction";
import { BasicPokerStrategy } from "./PokerStrategy"
import * as ROT from 'rot-js';

let characterCounter = 0;
let nextCharacterId = () => characterCounter++;

let opinionMap = [];

export class Character {
    constructor(level, strength, quickness, cunning, guile, grit) {
        this.name = 'Stranger';
        this.symbol = '@';
        this.color = 'white';
        this.isPC = false;
        this.isNPC = true;

        this.id = nextCharacterId();

        this.cents = 0;
        this.bullets = 0;
        this.buckshot = 0;
        this.arrows = 0;
        this.inventory = [];
        this.bodyCarried = null;
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

        this.utterance = '';
        this.utteranceBuffer = [];
        this.activePokerPlayerRole = null;

        let aggressiveness = _.sample([0., 0.25, 0.5, 0.75, 1.0]);
        let cheatiness = _.sample([0., 0.25, 0.5, 0.75, 1.0]);
        this.pokerStrategy = new BasicPokerStrategy(aggressiveness, cheatiness);
    }

    onGameStart() {
    }

    getDefaultOpinionOf(other) {
        if (this.profession.includes('US Marshal') && other.profession.includes('Lakota')) {
            return -10;
        }
        if (other.profession.includes('US Marshal') && this.profession.includes('Lakota')) {
            return -10;
        }
        if (other.profession.includes('US Marshal') && this.profession.includes('US Marshal')) {
            return 5;
        }
        if (other.profession.includes('Lakota') && this.profession.includes('Lakota')) {
            return 5;
        }
        if (other.profession.includes('Lakota') && !this.profession.includes('Lakota')) {
            return -5;
        }
        if (!other.profession.includes('Lakota') && this.profession.includes('Lakota')) {
            return -5;
        }
        return 0;
    }

    getOpinionOf(other) {
        if (!opinionMap.hasOwnProperty(this.id)) {
            opinionMap[this.id] = [];
            opinionMap[this.id][other.id] = 0;
        } else if (!opinionMap[this.id].hasOwnProperty(other.id)) {
            opinionMap[this.id][other.id] = this.getDefaultOpinionOf(other);
        }
        return opinionMap[this.id][other.id];
    }

    setOpinionOf(other, opinion) {
        if (!opinionMap.hasOwnProperty(this.id)) {
            opinionMap[this.id] = [];
        }
        opinionMap[this.id][other.id] = opinion;
        return opinionMap[this.id][other.id];
    }

    modifyOpinionOf(other, opinionChange) {
        return this.setOpinionOf(other, this.getOpinionOf(other) + opinionChange);
    }

    getDisplayChar() {
        return {
            symbol: this.symbol,
            color: this.color
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
    }

    join(pokerGame) {
        if (this.isNPC) {
            this.say(`I'm joining this game.`);
        }
        let p = pokerGame.addPlayer(this);
        this.activePokerPlayerRole = p;
    }

    say(utterance) {
        this.utteranceBuffer.push(utterance);
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
        this.game.log(`${this.name} draws his ${weapon.name}.`);
    }

    unequip() {
        if (this.equippedWeapon.unloadsWhenStowed) {
            this[this.equippedWeapon.ammoType] += this.equippedWeapon.currentAmmo;
            this.equippedWeapon.currentAmmo = 0;
        }
        this.game.log(`${this.name} stows his ${this.equippedWeapon.name}.`);
        this.equippedWeapon = null;

    }

    reload() {
        let weapon = this.getCurrentWeapon();
        weapon.currentAmmo++;
        this[weapon.ammoType]--;
        this.game.log(`${this.name} reloads his ${weapon.name}.`);
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

    isHostileTo(other) {
        if (this.getOpinionOf(other) <= -10) {
            return true;
        }
        return false;
    }

    canAttack(target) {
        let weapon = this.getCurrentWeapon();
        let distance = this.distanceBetween(target);
        let range = [RANGE_POINT_BLANK, RANGE_CLOSE, RANGE_MEDIUM, RANGE_LONG].find(r => distance >= RANGES[r].min && distance <= RANGES[r].max);
        if (!range) {
            return false;
        }
        if (range > weapon.maximumRange) {
            return false;
        }

        if (weapon.capacity && weapon.currentAmmo < 1) {
            return false;
        }

        return this.game.map.lineOfSightExistsBetween(this, target);
    }

    attack(target) {
        let weapon = this.getCurrentWeapon();
        let distance = this.distanceBetween(target);
        let range = [RANGE_POINT_BLANK, RANGE_CLOSE, RANGE_MEDIUM, RANGE_LONG].find(r => distance >= RANGES[r].min && distance <= RANGES[r].max);

        let rangeBonus = weapon.rangeModifiers ? weapon.rangeModifiers[range] : 0;

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
            this.game.log(`${this.name} misses ${target.name} at ${RANGES[range].name} range (${rangeBonus >= 0 ? '+' + rangeBonus : rangeBonus}) with his ${weapon.name}.`);
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

        if (this.isPC) {
            this.game.gameOver = true;
        }
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

    move(x, y) {
        this.previousSpace = { x: this.x, y: this.y };
        this.x = x;
        this.y = y;
    }

    onCheated(target) {
        let roll = _.random(1, 10) + target.subterfuge;
        console.log(target.name + ' tries to cheat ' + this.name + ': ' + roll.toString() + ' vs ' + this.vigilance.toString())
        if (roll < this.vigilance) {
            console.log(this.name + ' catches ' + target.name + ' cheating');
            this.onCatchesCheater(target);
        }
    }

    onCatchesCheater(target) {
    }

    onTurnEnd() {
        this.utterance = this.utteranceBuffer.join(' ');
        this.utteranceBuffer = [];
    }
}

export class PlayerCharacter extends Character {
    constructor() {
        super(0, 1, 0, 0, 0, 1);
        this.name = 'Rodney';
        this.cents = 2000;
        this.isPC = true;
        this.isNPC = false;
        this.bullets = 36;
        this.buckshot = 0;
        this.arrows = 0;

        this.profession = '(You)';

        this.inventory.push(new Pistol(true));
        this.inventory.push(new Knife());
        this.inventory.push(new CanOfBeans());
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

    onAttack(target) {
        if (!target.isHostileTo(this)) {
            this.game.characters.forEach(c => {
                if (c.isNPC && c.getOpinionOf(target) >= 0) {
                    c.modifyOpinionOf(this, -2 * c.desires.attackProvokers);
                }
            });
        }
        let opinion = target.modifyOpinionOf(this, -20);
    }

    onKill(target) {
        this.gainXp(5);
    }

    onCatchesCheater(target) {
        this.game.log("You caught " + target.name + " cheating!");
    }

}

export class NonPlayerCharacter extends Character {
    constructor(level, strength, quickness, cunning, guile, grit) {
        super(level, strength, quickness, cunning, guile, grit);

        this.profession = 'NPC';

        this.desires = {
            gamble: 0,
            travel: 0,
            attackProvokers: 0,
            defendBank: 0,
            buryBodies: 0
        };
        this.winningStreak = 0;
        this.losingStreak = 0;

    }

    getThreats() {
        return this.game.characters.filter(c => this.isHostileTo(c));
    }

    getPossibleTargets() {
        return this.getThreats().filter(c => this.canAttack(c));
    }

    getBestWeapon(target) {

        let useableWeapons = this.inventory.filter(i => i.isWeapon && (!i.capacity || i.currentAmmo > 0 || this[i.ammoType] > 0)).concat([this.naturalWeapon]);

        if (useableWeapons.every(w => w.isMelee)) {
            return useableWeapons.sort((a, b) => this.getDamageWithWeapon(b).max - this.getDamageWithWeapon(a).max)[0];
        }

        let distance = this.distanceBetween(target);
        let range = [RANGE_POINT_BLANK, RANGE_CLOSE, RANGE_MEDIUM, RANGE_LONG].find(r => distance >= RANGES[r].min && distance <= RANGES[r].max);

        if (range === RANGE_POINT_BLANK) {
            return useableWeapons.filter(w => w.isMelee).sort((a, b) => this.getDamageWithWeapon(b).max - this.getDamageWithWeapon(a).max)[0];
        }

        return useableWeapons.filter(w => !w.isMelee).sort((a, b) => b.rangeModifiers[range] - a.rangeModifiers[range])[0];
    }

    generateNewPathIfRequired(destX, destY) {
        if (!this.path || !this.aStar || (this.aStar._toX !== destX && this.aStar._toY !== destY)) {
            this.aStar = new ROT.Path.AStar(destX, destY, (x, y) => this.spaceIsValidPath(x, y));
            this.path = [];
            this.aStar.compute(this.x, this.y, (x, y) => {
                this.path.push({ x, y });
            });
            this.path.shift(); //remove the space you are already in
        }
    }

    spaceIsValidPath(x, y) {
        if (this.x === x && this.y === y) {
            return true;
        }

        if (Math.abs(x - this.x) > MAX_PATHFINDING_RADIUS || Math.abs(y - this.y) > MAX_PATHFINDING_RADIUS) {
            return false;
        }

        return !this.game.isSpaceBlocked(x, y);
    }

    walkPathIfPossible(x, y) {
        this.generateNewPathIfRequired(x, y);

        if (!this.path.length) {
            return false;
        }

        if (!this.spaceIsValidPath(this.path[0].x, this.path[0].y)) {
            let charactersInTheWay = this.game.getCharacters(this.path[0].x, this.path[0].y);
            if (charactersInTheWay.length) {
                if (this.getOpinionOf(charactersInTheWay[0]) <= 0) {
                    this.modifyOpinionOf(charactersInTheWay[0], -1);
                    this.say('Get out of my way!');
                }
                console.log(this.name + ' is blocking ' + charactersInTheWay[0].name);
                this.aStar = null;
                this.path = null;
                return false;
            }
        }

        if (this.path.length) {
            let nextSpace = this.path.shift();
            if (this.spaceIsValidPath(nextSpace.x, nextSpace.y)) {
                this.move(nextSpace.x, nextSpace.y);
                return true;
            }
        }

        return false;
    }

    takeTurn() {
        this.startTurn();

        // First the NPC takes care of combat and personal safety;

        if (this.canReload() && !this.getCurrentWeapon().currentAmmo) {
            this.reload();
            return;
        }

        let targets = this.getPossibleTargets().sort((a, b) => a.health - b.health);

        if (targets.length) {
            this.attack(targets[0]);
            return;
        }

        if (this.canReload()) {
            this.reload();
            return;
        }

        let threats = this.getThreats().sort((a, b) => a.distanceBetween(b));
        if (threats.length) {
            let bestWeapon = this.getBestWeapon(threats[0]);
            if (bestWeapon !== this.getCurrentWeapon()) {
                if (bestWeapon === this.naturalWeapon) {
                    this.unequip();
                    return;
                } else {
                    this.equip(bestWeapon);
                    return;
                }
            }

            let destination = threats[0];

            if (this.walkPathIfPossible(destination.x, destination.y)) {
                return;
            }

        } else {
            if (this.getCurrentWeapon() !== this.naturalWeapon) {
                this.unequip();
                return;
            }
        }

        if (this.health < this.getMaxHealth() && this.cents >= 100 && !this.activePokerPlayerRole) {
            let surgeons = this.game.characters.filter(c => c.profession === 'Surgeon');
            if (surgeons) {
                let nearestSurgeon = surgeons.sort((a, b) => this.distanceBetween(a) - this.distanceBetween(b))[0];
                if (this.distanceBetween(nearestSurgeon) === 1) {
                    let sellInteractions = nearestSurgeon.getInteractions(this).filter(i => i instanceof Heal);
                    sellInteractions[0].onInteract(this);
                    return;
                }
                if (this.walkPathIfPossible(nearestSurgeon.x, nearestSurgeon.y)) {
                    return;
                }
            }
        }

        // At this point the NPC is not in combat, and is not worried about any immediate threats;

        // Bury bodies if he's into that sort of thing
        if (this.desires.buryBodies > 0) {
            if (!this.nextGravePlot) {
                this.nextGravePlot = this.getEmptyGravePlot();
            }
            if (this.bodyCarried) {
                if (this.distanceBetween({ x: this.nextGravePlot[0], y: this.nextGravePlot[1] }) <= 1) {
                    this.buryBody(this.nextGravePlot[0], this.nextGravePlot[1]);
                    return;
                }
                if (this.walkPathIfPossible(this.nextGravePlot[0], this.nextGravePlot[1])) {
                    return;
                }
            }
            let closestUnburiedBody = this.game.objects.filter(o => o.isBody).sort((a, b) => this.distanceBetween(a) - this.distanceBetween(b))[0];
            if (closestUnburiedBody) {
                if (this.distanceBetween(closestUnburiedBody) <= 1) {
                    this.bodyCarried = closestUnburiedBody;
                    _.remove(this.game.objects, closestUnburiedBody);
                    return;
                }
                if (this.walkPathIfPossible(closestUnburiedBody.x, closestUnburiedBody.y)) {
                    return;
                }
            }

        }

        // Return to your post
        if (this.desires.defendBank) {
            let unmannedGuardPost = this.game.guardPosts.filter(p => this.spaceIsValidPath(p.x, p.y))[0];
            if (unmannedGuardPost) {
                if (this.walkPathIfPossible(unmannedGuardPost.x, unmannedGuardPost.y)) {
                    return;
                }
            }
        }

        // look for a game if he wants to gamble
        let possiblePokerGames = this.game.pokerGames.filter(g => this.cents >= 2 * g.bigBlind)
        let nearestPokerGame = possiblePokerGames.sort((a, b) => this.distanceBetween(a) - this.distanceBetween(b))[0];
        if (nearestPokerGame && !this.activePokerPlayerRole && this.desires.gamble > 0) {
            if (this.distanceBetween(nearestPokerGame) === 1) {
                this.join(nearestPokerGame);
                return;
            }
            if (this.walkPathIfPossible(nearestPokerGame.x, nearestPokerGame.y)) {
                return;
            }
        }

        let pokerPlayerRole = this.activePokerPlayerRole;
        if (pokerPlayerRole && pokerPlayerRole.isActivePlayer() && pokerPlayerRole.game.waitingForActivePlayerAction) {
            this.pokerStrategy.play(pokerPlayerRole);
            pokerPlayerRole.game.activePlayer = pokerPlayerRole.game.getNextPlayer(pokerPlayerRole, true);
            return;
        }

        if (pokerPlayerRole && pokerPlayerRole.isDealer() && pokerPlayerRole.game.waitingForDealerAction) {
            pokerPlayerRole.deal();
            return;
        }

        // should we check here if a character wants to leave a poker game?

        // If you want to play poker but don't have enough money, sell your stuff
        if (!this.activePokerPlayerRole && this.desires.gamble > 0) {
            if (this.inventory.length > 0) {
                let smallestBigBlind = Math.min(...this.game.pokerGames.map(g => g.bigBlind));
                let inventoryValue = this.inventory.map(i => i.value).reduce((a, b) => a + b);
                if (inventoryValue + this.cents >= 2 * smallestBigBlind) {
                    let shopKeeps = this.game.characters.filter(c => c.profession == 'Shopkeeper');
                    if (shopKeeps) {
                        let nearestShopKeep = shopKeeps.sort((a, b) => this.distanceBetween(a) - this.distanceBetween(b))[0];
                        if (this.distanceBetween(nearestShopKeep) === 1) {
                            let sellInteractions = nearestShopKeep.getInteractions(this).filter(i => i instanceof ItemSell);
                            sellInteractions[0].onInteract(this);
                            return;
                        }
                        if (this.walkPathIfPossible(nearestShopKeep.x, nearestShopKeep.y)) {
                            return;
                        }
                    }
                }
            }
            this.desires.travel++;
        }

        //hacky variables, delete these later
        if (this.profession === 'Shopkeeper') {
            if (this.game.storeNeedsBullets && _.random(1, 100) < 5) {
                this.addItem(new BoxOfBullets());
                this.game.storeNeedsBullets = false;
                return;
            }
            if (this.game.storeNeedsBuckshot && _.random(1, 100) < 5) {
                this.addItem(new BoxOfBuckshot());
                this.game.storeNeedsBuckshot = false;
                return;
            }
        }
        //hacky variables, delete these later

        // check if the character wants to leave the map
        if (!this.activePokerPlayerRole && this.desires.travel > 10) {
            if (this.x < -50 && this.distanceBetween(this.game.player) > 35) {
                this.game.removeCharacter(this);
                return;
            }
            if (this.x <= 0 && Math.abs(this.y) < 3 && this.spaceIsValidPath(this.x - 1, this.y)) {
                this.move(this.x - 1, this.y);
                return;
            }
            if (this.walkPathIfPossible(0, 0)) {
                return;
            }
        }

        this.wait();
    }

    onAttack(target) {
    }

    onKill(target) {
    }

    onCatchesCheater(target) {
        this.say(target.name + ", I think you're cheating.");
        this.modifyOpinionOf(target, -5);
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
        this.color = _.sample(['purple', 'lawngreen', 'deeppink']);
        this.profession = 'Scoundrel';

        this.inventory.push(_.sample([new Knife(), new Pistol(true), new Pistol(true), new Revolver(true)]));
        this.bullets = 20;

        this.cents = 2000;

        this.desires.attackProvokers = 1;
        this.desires.gamble = 10;

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
        this.color = 'black';
        this.profession = 'Priest';

        this.cents = 2000;

    }
}

export class Undertaker extends NonPlayerCharacter {
    constructor(top, left, width, height) {
        super(
            _.sample([0, 0, 1, 2]), // Level
            _.sample([1, 1, 2, 3]), // Strength
            _.sample([0, 0, 0, 1]), // Quickness
            _.sample([0, 0, 0, 1]), // Cunning
            _.sample([0, 0, 0, 1]), // Guile
            _.sample([1, 2, 3, 4]), // Grit
        );
        this.name = `${_.sample(MALE_NAMES)} ${_.sample(LAST_NAMES)}`;
        this.symbol = '@';
        this.color = 'black';
        this.profession = 'Undertaker';

        this.cents = 150;

        this.inventory.push(new Shovel(true));

        this.cemetaryTop = top;
        this.cemetaryLeft = left;
        this.cemetaryWidth = width;
        this.cemetaryHeight = height;

        this.desires.buryBodies = 1;

        this.nextGravePlot = null;

    }

    getEmptyGravePlot() {
        let spaces = [];
        for (let x = this.cemetaryLeft + 1; x < this.cemetaryLeft + this.cemetaryWidth; x++) {
            for (let y = this.cemetaryTop + 3; y < this.cemetaryTop + this.cemetaryHeight; y += 2) {
                if (x != this.cemetaryLeft + this.cemetaryWidth / 2) {
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

    buryBody(x, y) {
        this.bodyCarried = null;
        this.game.map.setTile(x, y, TILE_GRAVE);
        this.nextGravePlot = this.getEmptyGravePlot();
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
        this.color = 'green';
        this.profession = 'Shopkeeper';
        this.inventory.push(new Revolver(true));
        this.bullets = 30;
        this.shopTop = top;
        this.shopLeft = left;
        this.shopWidth = width;
        this.shopHeight = height;
        this.cents = 8000;

    }

    getInteractions(character) {
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
                if (x != this.shopLeft + this.shopWidth / 2) {
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

export class Surgeon extends NonPlayerCharacter {
    constructor() {
        super(
            _.sample([0, 0, 1, 2]), // Level
            _.sample([0, 1, 1, 1]), // Strength
            _.sample([0, 1, 1, 2]), // Quickness
            _.sample([2, 3, 4, 5]), // Cunning
            _.sample([0, 0, 0, 1]), // Guile
            _.sample([0, 0, 1, 2]), // Grit
        );
        this.name = `${_.sample(MALE_NAMES)} ${_.sample(LAST_NAMES)}`;
        this.symbol = '@';
        this.color = 'white';
        this.profession = 'Surgeon';
        this.inventory.push(new Knife());
        this.cents = 4000;

    }

    getInteractions(character) {
        let interactions = [];
        if (character.health < character.getMaxHealth() && character.cents >= 100) {
            interactions.push(new Heal(this, character, 100));
        }
        /*if (this.getEmptyShopSpace()) {
            for (let item of character.inventory) {
                if (item.value > 0) {
                    interactions.push(new ItemSell(this, character, item, item.value));
                }
            }
        }*/
        return interactions;
    }

    /*addItem(item) {
        let space = this.getEmptyShopSpace();
        this.game.addObject(new ShopItem(item, item.value, this), space[0], space[1]);
    }*/

}

export class Marshal extends NonPlayerCharacter {
    constructor() {
        super(
            _.sample([1, 2, 3, 4]), // Level
            _.sample([0, 1, 2, 2]), // Strength
            _.sample([0, 1, 1, 2]), // Quickness
            _.sample([0, 0, 1, 1]), // Cunning
            _.sample([0, 0, 1, 2]), // Guile
            _.sample([1, 2, 3, 4]), // Grit
        );
        this.name = `${_.sample(MALE_NAMES)} ${_.sample(LAST_NAMES)}`;
        this.symbol = '@';
        this.color = 'blue';
        this.profession = 'US Marshal';

        this.cents = 4000;

        this.desires.attackProvokers = 5;
        this.desires.defendBank = 5;

        this.inventory.push(new Rifle(true));
        this.inventory.push(new Revolver(true));
        this.bullets = 120;

    }
}

export class LakotaScout extends NonPlayerCharacter {
    constructor() {
        super(
            _.sample([0, 0, 1, 1]), // Level
            _.sample([1, 1, 1, 1]), // Strength
            _.sample([1, 1, 1, 2]), // Quickness
            _.sample([0, 0, 1, 2]), // Cunning
            _.sample([0, 0, 1, 1]), // Guile
            _.sample([0, 0, 1, 1]), // Grit
        );
        this.name = _.sample(LAKOTA_MALE_NAMES);
        this.symbol = '@';
        this.color = 'firebrick';
        this.profession = 'Lakota Scout';

        this.cents = 0;

        this.inventory.push(_.sample([new Pistol(true), new Rifle(true), new Bow()]));
        this.inventory.push(new Knife());
        this.arrows = 20;
        this.bullets = 20;

    }
}

export class LakotaWarrior extends NonPlayerCharacter {
    constructor() {
        super(
            _.sample([1, 2, 2, 3]), // Level
            _.sample([2, 2, 3, 4]), // Strength
            _.sample([0, 1, 2, 3]), // Quickness
            _.sample([0, 1, 1, 2]), // Cunning
            _.sample([0, 0, 1, 1]), // Guile
            _.sample([1, 2, 3, 4]), // Grit
        );
        this.name = _.sample(LAKOTA_MALE_NAMES);
        this.symbol = '@';
        this.color = 'red';
        this.profession = 'Lakota Warrior';

        this.cents = 0;

        this.inventory.push(new Rifle(true));
        this.inventory.push(new Axe());
        this.bullets = 30;

    }
}

export class Banker extends NonPlayerCharacter {
    constructor(top, left, width, height) {
        super(
            _.sample([0, 0, 1, 2]), // Level
            _.sample([0, 1, 1, 2]), // Strength
            _.sample([0, 0, 1, 2]), // Quickness
            _.sample([1, 2, 3, 4]), // Cunning
            _.sample([0, 0, 0, 1]), // Guile
            _.sample([0, 0, 0, 1]), // Grit
        );
        this.name = `${_.sample(MALE_NAMES)} ${_.sample(LAST_NAMES)}`;
        this.symbol = '@';
        this.color = 'green';
        this.profession = 'Banker';

        this.inventory.push(new Revolver(true));
        //this.inventory.push(new VaultKey());
        this.bullets = 12;
        this.shopTop = top;
        this.shopLeft = left;
        this.shopWidth = width;
        this.shopHeight = height;
        this.cents = 8000;
        this.cashList = [];
        this.accounts = {};

    }

    getInteractions(character) {
        let interactions = [];
        if (this.accounts[character]) {
            if (this.accounts[character] >= 1000) {
                interactions.push(new MoneyWithdrawl(this, 1000));
            }
            else if (this.accounts[character] > 0) {
                interactions.push(new MoneyWithdrawl(this, this.accounts[character]));
            }
        }
        if (character.cents >= 1000) {
            interactions.push(new MoneyDeposit(this, 1000));
        }
        return interactions;
    }

    getEmptyVaultSpace() {
        let spaces = [];
        for (let x = this.shopLeft + 1; x < this.shopLeft + this.shopWidth; x++) {
            for (let y = this.shopTop + 3; y < this.shopTop + this.shopHeight; y += 2) {
                if (x != this.shopLeft + this.shopWidth / 2) {
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

    onGameStart() {
        this.addMoneyToVault(2000);
        this.addMoneyToVault(2000);
    }

    takeMoney(value, character) {
        character.cents -= value;
        if (!this.accounts[character]) {
            this.accounts[character] = value;
        }
        else {
            this.accounts[character] += value;
        }
        this.addMoneyToVault(value);
    }

    addMoneyToVault(value) {
        let space = this.getEmptyVaultSpace()
        let cash = this.game.addObject(new Cash(value), space[0], space[1]);
        this.cashList.push(cash)
    }

    giveMoney(value, character) {
        character.cents += value
        this.accounts[character] -= value
        while (value >= this.cashList[0].value) {
            value -= this.cashList[0].value;
            this.cashList[0].delete();
            _.remove(this.cashList, this.cashList[0]);
        }
        this.cashList[0].value = this.cashList[0].value - value;


    }
}
