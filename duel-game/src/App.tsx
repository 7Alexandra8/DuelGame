import React, { useEffect, useRef, useState } from 'react';
import './App.css';

type HeroParams = {
    spellColor: string;
    fireRate: number;
    moveSpeed: number;
};

type Hero = HeroParams & {
    x: number;
    y: number;
    radius: number;
    dx: number;
    dy: number;
    color: string;
    spells: Spell[];
};

type Spell = {
    x: number;
    y: number;
    dx: number;
    dy: number;
    radius: number;
    color: string;
};

const App: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hero1Params, setHero1Params] = useState<HeroParams>({
        spellColor: 'red',
        fireRate: 1000,
        moveSpeed: 2,
    });
    const [hero2Params, setHero2Params] = useState<HeroParams>({
        spellColor: 'blue',
        fireRate: 1000,
        moveSpeed: 2,
    });

    const [score, setScore] = useState({ hero1: 0, hero2: 0 });
    const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const hero1: Hero = {
            ...hero1Params,
            x: 50,
            y: canvas.height / 4,
            radius: 20,
            dx: 0,
            dy: hero1Params.moveSpeed,
            color: 'green',
            spells: [],
        };

        const hero2: Hero = {
            ...hero2Params,
            x: canvas.width - 50,
            y: (3 * canvas.height) / 4,
            radius: 20,
            dx: 0,
            dy: -hero2Params.moveSpeed,
            color: 'purple',
            spells: [],
        };

        let lastFireTime1 = Date.now();
        let lastFireTime2 = Date.now();

        const update = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            moveHero(hero1, canvas);
            moveHero(hero2, canvas);

            handleSpellCasting(hero1, lastFireTime1, Date.now(), hero2, canvas, 'hero1', setScore);
            handleSpellCasting(hero2, lastFireTime2, Date.now(), hero1, canvas, 'hero2', setScore);

            drawHero(ctx, hero1);
            drawHero(ctx, hero2);

            hero1.spells.forEach((spell) => drawSpell(ctx, spell));
            hero2.spells.forEach((spell) => drawSpell(ctx, spell));

            requestAnimationFrame(update);
        };

        update();

        const handleMouseMove = (e: MouseEvent) => {
            const { offsetX, offsetY } = e;
            bounceOffMouse(hero1, offsetX, offsetY);
            bounceOffMouse(hero2, offsetX, offsetY);
        };

        canvas.addEventListener('mousemove', handleMouseMove);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [hero1Params, hero2Params]);

    const handleHeroClick = (hero: Hero) => {
        setSelectedHero(hero);
    };

    const handleHeroParamsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedHero) return;
        const { name, value } = e.target;
        const updatedHeroParams = { ...selectedHero, [name]: value };

        if (selectedHero === hero1Params) {
            setHero1Params(updatedHeroParams);
        } else if (selectedHero === hero2Params) {
            setHero2Params(updatedHeroParams);
        }
    };

    return (
        <div className="App">
            <canvas ref={canvasRef} width={800} height={600} />
            <div className="controls">
                <h2>Hero 1 Controls</h2>
                <label>
                    Fire Rate:
                    <input
                        type="range"
                        min="100"
                        max="2000"
                        value={hero1Params.fireRate}
                        onChange={(e) =>
                            setHero1Params({ ...hero1Params, fireRate: parseInt(e.target.value, 10) })
                        }
                    />
                </label>
                <label>
                    Move Speed:
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={hero1Params.moveSpeed}
                        onChange={(e) =>
                            setHero1Params({ ...hero1Params, moveSpeed: parseInt(e.target.value, 10) })
                        }
                    />
                </label>
                <label>
                    Spell Color:
                    <input
                        type="color"
                        value={hero1Params.spellColor}
                        onChange={(e) =>
                            setHero1Params({ ...hero1Params, spellColor: e.target.value })
                        }
                    />
                </label>

                <h2>Hero 2 Controls</h2>
                <label>
                    Fire Rate:
                    <input
                        type="range"
                        min="100"
                        max="2000"
                        value={hero2Params.fireRate}
                        onChange={(e) =>
                            setHero2Params({ ...hero2Params, fireRate: parseInt(e.target.value, 10) })
                        }
                    />
                </label>
                <label>
                    Move Speed:
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={hero2Params.moveSpeed}
                        onChange={(e) =>
                            setHero2Params({ ...hero2Params, moveSpeed: parseInt(e.target.value, 10) })
                        }
                    />
                </label>
                <label>
                    Spell Color:
                    <input
                        type="color"
                        value={hero2Params.spellColor}
                        onChange={(e) =>
                            setHero2Params({ ...hero2Params, spellColor: e.target.value })
                        }
                    />
                </label>
            </div>
            <div className="scoreboard">
                <p>Hero 1 Score: {score.hero1}</p>
                <p>Hero 2 Score: {score.hero2}</p>
            </div>
        </div>
    );
};

const drawHero = (ctx: CanvasRenderingContext2D, hero: Hero) => {
    ctx.beginPath();
    ctx.arc(hero.x, hero.y, hero.radius, 0, Math.PI * 2);
    ctx.fillStyle = hero.color;
    ctx.fill();
    ctx.closePath();
};

const moveHero = (hero: Hero, canvas: HTMLCanvasElement) => {
    hero.y += hero.dy;

    if (hero.y - hero.radius <= 0 || hero.y + hero.radius >= canvas.height) {
        hero.dy *= -1;
    }
};

const drawSpell = (ctx: CanvasRenderingContext2D, spell: Spell) => {
    ctx.beginPath();
    ctx.arc(spell.x, spell.y, spell.radius, 0, Math.PI * 2);
    ctx.fillStyle = spell.color;
    ctx.fill();
    ctx.closePath();
};

const bounceOffMouse = (hero: Hero, mouseX: number, mouseY: number) => {
    const distance = Math.hypot(hero.x - mouseX, hero.y - mouseY);
    if (distance < hero.radius + 10) {
        hero.dy *= -1;
    }
};

const handleSpellCasting = (
    hero: Hero,
    lastFireTime: number,
    currentTime: number,
    opponent: Hero,
    canvas: HTMLCanvasElement,
    heroKey: 'hero1' | 'hero2',
    setScore: React.Dispatch<React.SetStateAction<{ hero1: number; hero2: number }>>
) => {
    if (currentTime - lastFireTime > hero.fireRate) {
        hero.spells.push({
            x: hero.x,
            y: hero.y,
            dx: heroKey === 'hero1' ? 5 : -5,
            dy: 0,
            radius: 5,
            color: hero.spellColor,
        });

        lastFireTime = currentTime;
    }

    hero.spells.forEach((spell, index) => {
        spell.x += spell.dx;

        if (spell.x < 0 || spell.x > canvas.width) {
            hero.spells.splice(index, 1);
            return;
        }

        if (
            Math.hypot(spell.x - opponent.x, spell.y - opponent.y) < opponent.radius
        ) {
            hero.spells.splice(index, 1);
            setScore((prevScore) => ({
                ...prevScore,
                [heroKey]: prevScore[heroKey] + 1,
            }));
        }
    });
};

export default App;
