import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type Screen = 'title' | 'playing' | 'clear' | 'over';

function App() {
  const [screen, setScreen] = useState<Screen>('title');

  if (screen === 'title') {
    return <TitleScreen onStart={() => setScreen('playing')} />;
  }

  if (screen === 'playing') {
    return <Game onEnd={(result) => setScreen(result)} />;
  }

  return <ResultScreen result={screen} onRestart={() => setScreen('title')} />;
}

// ===============================
// タイトル画面
// ===============================
function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a1a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: 'white', fontFamily: 'sans-serif', overflow: 'hidden',
      position: 'relative',
    }}>
      {/* 背景の装飾（浮遊する光の粒） */}
      <FloatingParticles />

      <div style={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
        <div style={{
          fontSize: 128, fontWeight: 'bold', letterSpacing: '0.3em',
          color: '#88ccff', textShadow: '0 0 40px #4488ff, 0 0 80px #4488ff',
          marginBottom: 16,
        }}>
          SENS
        </div>
        <div style={{
          fontSize: 18, letterSpacing: '0.4em', opacity: 0.7, marginBottom: 8,
        }}>
          ― 3D SPINOFF ―
        </div>
        <div style={{
          fontSize: 14, opacity: 0.5, maxWidth: 500, lineHeight: 1.8,
          margin: '40px auto', letterSpacing: '0.1em',
        }}>
          五感を超常レベルで操る「覚醒者」は、<br />
          世界を蝕む怪物「ロスト」と戦う。<br />
          あなたの感覚が、世界の運命を決する。
        </div>

        <button
          onClick={onStart}
          style={{
            padding: '16px 64px', fontSize: 24, letterSpacing: '0.3em',
            background: 'transparent', color: 'white',
            border: '2px solid #4488ff', cursor: 'pointer',
            fontFamily: 'sans-serif', marginTop: 40,
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(68, 136, 255, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 30px #4488ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          START
        </button>

        <div style={{ marginTop: 60, fontSize: 12, opacity: 0.4, lineHeight: 2 }}>
          WASD : 移動 / マウス : 照準<br />
          左クリック : 斬撃（触覚） / Q : 音波（聴覚） / E : 視閃（視覚）
        </div>
      </div>
    </div>
  );
}

// 浮遊する光の粒（タイトル背景の演出）
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => i);
  return (
    <>
      {particles.map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 3, height: 3,
            background: '#88ccff',
            borderRadius: '50%',
            boxShadow: '0 0 10px #4488ff',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.6 + 0.2,
            animation: `float ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </>
  );
}

// ===============================
// リザルト画面
// ===============================
function ResultScreen({ result, onRestart }: { result: 'clear' | 'over'; onRestart: () => void }) {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a1a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: 'white', fontFamily: 'sans-serif',
    }}>
      <div style={{
        fontSize: 72, fontWeight: 'bold',
        color: result === 'clear' ? '#88ccff' : '#ff4444',
        textShadow: `0 0 30px currentColor`,
        letterSpacing: '0.2em', marginBottom: 20,
      }}>
        {result === 'clear' ? 'MISSION CLEAR' : 'DEFEATED'}
      </div>
      <div style={{ fontSize: 18, opacity: 0.7, marginBottom: 60 }}>
        {result === 'clear' ? 'すべてのロストを殲滅した' : '覚醒者は倒れた…'}
      </div>
      <button
        onClick={onRestart}
        style={{
          padding: '14px 48px', fontSize: 20, letterSpacing: '0.2em',
          background: 'transparent', color: 'white',
          border: '2px solid #4488ff', cursor: 'pointer',
          fontFamily: 'sans-serif', transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(68, 136, 255, 0.2)';
          e.currentTarget.style.boxShadow = '0 0 30px #4488ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        TITLE
      </button>
    </div>
  );
}

// ===============================
// ゲーム本体
// ===============================
function Game({ onEnd }: { onEnd: (result: 'clear' | 'over') => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyCount, setEnemyCount] = useState(8);
  const [lastSkill, setLastSkill] = useState<string>('');
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!mountRef.current) return;
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 20, 60);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xaabbff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x2a3a2a })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const player = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 1),
      new THREE.MeshStandardMaterial({ color: 0x4488ff, emissive: 0x112244 })
    );
    player.position.y = 1;
    player.castShadow = true;
    scene.add(player);

    const facingMarker = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x4488ff })
    );
    facingMarker.rotation.x = Math.PI / 2;
    scene.add(facingMarker);

    let playerAngle = 0;
    let playerHpLocal = 100;
    let damageCooldown = 0;

    type Enemy = {
      mesh: THREE.Mesh; speed: number; hp: number; maxHp: number;
      isBoss: boolean; hitFlash: number;
    };
    const enemies: Enemy[] = [];

    const createEnemy = (x: number, z: number, isBoss = false): Enemy => {
      const size = isBoss ? 2.5 : 1.2;
      const height = isBoss ? 3 : 1.8;
      const hp = isBoss ? 10 : 3;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size, height, size),
        new THREE.MeshStandardMaterial({
          color: isBoss ? 0x880022 : 0xaa2222,
          emissive: isBoss ? 0x660000 : 0x440000,
        })
      );
      mesh.position.set(x, height / 2, z);
      mesh.castShadow = true;
      scene.add(mesh);
      return { mesh, speed: isBoss ? 0.04 : 0.05 + Math.random() * 0.03, hp, maxHp: hp, isBoss, hitFlash: 0 };
    };

    enemies.push(createEnemy(10, 10));
    enemies.push(createEnemy(-10, 10));
    enemies.push(createEnemy(10, -10));
    enemies.push(createEnemy(-10, -10));
    enemies.push(createEnemy(0, 15));
    enemies.push(createEnemy(15, 0));
    enemies.push(createEnemy(-15, 0));
    enemies.push(createEnemy(0, -20, true));

    const damageEnemy = (enemy: Enemy, dmg: number) => {
      enemy.hp -= dmg;
      enemy.hitFlash = 8;
      if (enemy.hp <= 0) {
        scene.remove(enemy.mesh);
        enemy.mesh.geometry.dispose();
        (enemy.mesh.material as THREE.Material).dispose();
        const idx = enemies.indexOf(enemy);
        if (idx !== -1) enemies.splice(idx, 1);
        setEnemyCount(enemies.length);
      }
    };

    type Effect = { mesh: THREE.Mesh; life: number; maxLife: number; update: () => void };
    const effects: Effect[] = [];

    const createSlash = () => {
      setLastSkill('触覚・斬撃');
      const geo = new THREE.RingGeometry(1, 2.5, 16, 1, -Math.PI / 4, Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.copy(player.position);
      mesh.position.y = 1;
      mesh.rotation.z = playerAngle;
      scene.add(mesh);

      for (const e of [...enemies]) {
        const dx = e.mesh.position.x - player.position.x;
        const dz = e.mesh.position.z - player.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 2.5) {
          const angleToEnemy = Math.atan2(dx, dz);
          let diff = angleToEnemy - playerAngle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          if (Math.abs(diff) < Math.PI / 2) damageEnemy(e, 1);
        }
      }

      effects.push({
        mesh, life: 15, maxLife: 15,
        update() { this.life--; (mesh.material as THREE.MeshBasicMaterial).opacity = (this.life / this.maxLife) * 0.8; },
      });
    };

    const createSonic = () => {
      setLastSkill('聴覚・音波');
      const geo = new THREE.RingGeometry(0.5, 0.8, 32);
      const mat = new THREE.MeshBasicMaterial({ color: 0x88ffee, transparent: true, opacity: 1, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.copy(player.position);
      mesh.position.y = 0.1;
      scene.add(mesh);

      const startPos = player.position.clone();
      const hitEnemies = new Set<Enemy>();

      effects.push({
        mesh, life: 30, maxLife: 30,
        update() {
          this.life--;
          const progress = 1 - this.life / this.maxLife;
          const radius = 8 * progress;
          mesh.scale.set(radius, radius, radius);
          (mesh.material as THREE.MeshBasicMaterial).opacity = 1 - progress;
          for (const e of [...enemies]) {
            if (hitEnemies.has(e)) continue;
            const dx = e.mesh.position.x - startPos.x;
            const dz = e.mesh.position.z - startPos.z;
            if (Math.sqrt(dx * dx + dz * dz) < radius) {
              hitEnemies.add(e);
              damageEnemy(e, 2);
            }
          }
        },
      });
    };

    const createBeam = () => {
      setLastSkill('視覚・視閃');
      const beamLength = 20;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, beamLength),
        new THREE.MeshBasicMaterial({ color: 0xffff88, transparent: true, opacity: 0.9 })
      );
      mesh.position.copy(player.position);
      mesh.position.y = 1;
      mesh.position.x += Math.sin(playerAngle) * (beamLength / 2);
      mesh.position.z += Math.cos(playerAngle) * (beamLength / 2);
      mesh.rotation.y = playerAngle;
      scene.add(mesh);

      for (const e of [...enemies]) {
        const dx = e.mesh.position.x - player.position.x;
        const dz = e.mesh.position.z - player.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < beamLength) {
          const angleToEnemy = Math.atan2(dx, dz);
          let diff = angleToEnemy - playerAngle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          if (Math.abs(diff) < 0.15) damageEnemy(e, 3);
        }
      }

      effects.push({
        mesh, life: 20, maxLife: 20,
        update() { this.life--; (mesh.material as THREE.MeshBasicMaterial).opacity = (this.life / this.maxLife) * 0.9; },
      });
    };

    const keys: { [key: string]: boolean } = {};
    const cooldowns = { slash: 0, sonic: 0, beam: 0 };

    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      const k = e.key.toLowerCase();
      if (k === 'q' && cooldowns.sonic <= 0) { createSonic(); cooldowns.sonic = 60; }
      if (k === 'e' && cooldowns.beam <= 0) { createBeam(); cooldowns.beam = 45; }
    };
    const onKeyUp = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const mouseWorld = new THREE.Vector3();
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && cooldowns.slash <= 0) { createSlash(); cooldowns.slash = 20; }
    };
    window.addEventListener('mousedown', onMouseDown);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let running = true;
    const moveSpeed = 0.15;

    const animate = () => {
      if (!running) return;
      requestAnimationFrame(animate);

      if (keys['w']) player.position.z -= moveSpeed;
      if (keys['s']) player.position.z += moveSpeed;
      if (keys['a']) player.position.x -= moveSpeed;
      if (keys['d']) player.position.x += moveSpeed;

      raycaster.setFromCamera(mouse, camera);
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      raycaster.ray.intersectPlane(groundPlane, mouseWorld);
      const ddx = mouseWorld.x - player.position.x;
      const ddz = mouseWorld.z - player.position.z;
      playerAngle = Math.atan2(ddx, ddz);
      player.rotation.y = playerAngle;
      facingMarker.position.set(
        player.position.x + Math.sin(playerAngle) * 1.2, 0.3,
        player.position.z + Math.cos(playerAngle) * 1.2
      );
      facingMarker.rotation.z = -playerAngle;

      if (damageCooldown > 0) damageCooldown--;
      for (const enemy of enemies) {
        const dx = player.position.x - enemy.mesh.position.x;
        const dz = player.position.z - enemy.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.1) {
          enemy.mesh.position.x += (dx / dist) * enemy.speed;
          enemy.mesh.position.z += (dz / dist) * enemy.speed;
        }
        const contactRange = enemy.isBoss ? 2.0 : 1.3;
        if (dist < contactRange && damageCooldown <= 0) {
          const dmg = enemy.isBoss ? 15 : 5;
          playerHpLocal = Math.max(0, playerHpLocal - dmg);
          setPlayerHp(playerHpLocal);
          damageCooldown = 40;
        }
        if (enemy.hitFlash > 0) {
          enemy.hitFlash--;
          (enemy.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xffffff);
        } else {
          (enemy.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(
            enemy.isBoss ? 0x660000 : 0x440000
          );
        }
        for (const other of enemies) {
          if (other === enemy) continue;
          const ox = enemy.mesh.position.x - other.mesh.position.x;
          const oz = enemy.mesh.position.z - other.mesh.position.z;
          const odist = Math.sqrt(ox * ox + oz * oz);
          if (odist < 1.5 && odist > 0) {
            enemy.mesh.position.x += (ox / odist) * 0.03;
            enemy.mesh.position.z += (oz / odist) * 0.03;
          }
        }
      }

      for (let i = effects.length - 1; i >= 0; i--) {
        effects[i].update();
        if (effects[i].life <= 0) {
          scene.remove(effects[i].mesh);
          effects[i].mesh.geometry.dispose();
          (effects[i].mesh.material as THREE.Material).dispose();
          effects.splice(i, 1);
        }
      }

      if (cooldowns.slash > 0) cooldowns.slash--;
      if (cooldowns.sonic > 0) cooldowns.sonic--;
      if (cooldowns.beam > 0) cooldowns.beam--;

      if (playerHpLocal <= 0) { running = false; setTimeout(() => onEnd('over'), 500); }
      else if (enemies.length === 0) { running = false; setTimeout(() => onEnd('clear'), 500); }

      camera.position.set(player.position.x, player.position.y + 15, player.position.z + 12);
      camera.lookAt(player.position);

      renderer.render(scene, camera);
    };
    animate();

    const currentMount = mountRef.current;
    return () => {
      running = false;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('resize', onResize);
      if (currentMount && renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onEnd]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', cursor: 'crosshair' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      <div style={{
        position: 'absolute', top: 20, left: 20, color: 'white',
        fontFamily: 'sans-serif', textShadow: '0 0 4px black', userSelect: 'none',
      }}>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>覚醒者HP</div>
        <div style={{ width: 300, height: 20, background: 'rgba(0,0,0,0.5)', border: '1px solid #4488ff', borderRadius: 2 }}>
          <div style={{
            width: `${Math.max(0, playerHp)}%`, height: '100%',
            background: playerHp > 50 ? '#4488ff' : playerHp > 25 ? '#ffaa44' : '#ff4444',
            transition: 'width 0.2s',
          }} />
        </div>
        <div style={{ fontSize: 14, marginTop: 4 }}>{playerHp} / 100</div>
      </div>

      <div style={{
        position: 'absolute', top: 20, right: 20, color: 'white',
        fontFamily: 'sans-serif', textShadow: '0 0 4px black', textAlign: 'right', userSelect: 'none',
      }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>残存ロスト</div>
        <div style={{ fontSize: 32, fontWeight: 'bold', color: '#ff8888' }}>{enemyCount}</div>
      </div>

      <div style={{
        position: 'absolute', bottom: 20, left: 20, color: 'white',
        fontFamily: 'sans-serif', fontSize: 12, textShadow: '0 0 4px black',
        opacity: 0.8, userSelect: 'none', lineHeight: 1.6,
      }}>
        <div>WASD : 移動</div>
        <div>マウス : 照準</div>
        <div>左クリック : 斬撃（触覚）</div>
        <div>Q : 音波（聴覚）</div>
        <div>E : 視閃（視覚）</div>
      </div>

      {lastSkill && (
        <div style={{
          position: 'absolute', bottom: 20, right: 20, color: '#88ccff',
          fontFamily: 'sans-serif', fontSize: 18, textShadow: '0 0 6px black', userSelect: 'none',
        }}>
          発動：{lastSkill}
        </div>
      )}
    </div>
  );
}

export default App;