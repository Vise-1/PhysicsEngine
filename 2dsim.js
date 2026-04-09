 // Canvas and coordinate conversion
            var canvas = document.getElementById("2dcanvas");
            var ctx = canvas.getContext("2d");

            const directbtn = document.getElementById('3ddirect');

            directbtn.addEventListener('click', () => {
                // This tells the browser to move to the other page
                window.location.href = '/3dsim.html'; 
            });


            canvas.width = window.innerWidth - 20;
            canvas.height = window.innerHeight -150;

            var simMinWidth = 2.0;
            var cScale = Math.min(canvas.width, canvas.height)/ simMinWidth;
            var simWidth = canvas.width/cScale;
            var simHeight = canvas.height/cScale;

            function cX(pos){
                return pos.x * cScale;
            }

            function cY(pos){
                return canvas.height - pos.y * cScale;
            }


            function onWindowResize(){
                ctx.width = window.innerWidth;
                ctx.height = window.innerHeight;
            }

            class Vector2 {
                constructor(x = 0.0, y =0.0) {
                    this.x = x;
                    this.y = y;
                }

                set(v){
                    this.x = v.x; this.y = v.y;
                }

                clone(){
                    return new Vector2(this.x, this.y);
                }

                add(v, s = 1.0){
                    this.x += v.x * s;
                    this.y += v.y * s;

                    return this;
                }

                addVectors(a,b){
                    this.x = a.x + b.x;
                    this.y = a.y + b.y;
                    return this;
                }

                subtract(v, s = 1.0){
                    this.x -= v.x * s;
                    this.y -= v.y * s;

                    return this;
                }

                subtractVectors(a, b){
                    this.x = a.x - b.x;
                    this.y = a.y - b.y;
                    return this;
                }

                length(){
                    return Math.sqrt(this.x * this.x + this.y * this.y);
                }

                scale(s){
                    this.x *= s;
                    this.y *= s;
                }

                dot(v){
                    return this.x * v.x + this.y * v.y;
                }
            }

            class Ball{
                constructor(radius, mass, pos, vel, col){
                    this.radius = radius;
                    this.mass = mass;
                    this.pos = pos;
                    this.vel = vel;
                    this.col = col;
                }

                simulate(dt, gravity){
                    this.vel.add(gravity,dt);
                    this.pos.add(this.vel,dt);
                }
            }

            var PhysicsScene = {
                gravity : new Vector2(0.0, 0.0),
                dt: 1.0 / 60.0,
                worldsize : new Vector2(simWidth, simHeight),
                paused: true,
                balls : [],
                restitution: 1.0,
                col : Math.floor(360 * Math.random())
            }

            function setupScene(){
                PhysicsScene.balls = [];
                var numBalls = 20;

                for (let i=0 ; i < numBalls; i++){
                    var radius = 0.03 + Math.random() * 0.025;
                    var mass = Math.PI * radius * radius;
                    var pos = new Vector2(Math.random() * simWidth, Math.random() * simHeight);
                    var vel = new Vector2(-1.0 + Math.random() * 2.0, -1.0 + Math.random() * 2.0);
                    var col = Math.floor(360 * Math.random());

                    PhysicsScene.balls.push(new Ball(radius, mass, pos, vel, col));
                }
            }
            
            function addBall(){
                var radius = 0.03 + Math.random() * 0.025;
                var mass = Math.PI * radius * radius;
                var pos = new Vector2(Math.random() * simWidth, Math.random() * simHeight);
                var vel = new Vector2(-1.0 + Math.random() * 2.0, -1.0 + Math.random() * 2.0);
                var col = Math.floor(360 * Math.random());
                    
                PhysicsScene.balls.push(new Ball(radius, mass, pos, vel, col));
                console.log('yo')
            }

            function removeBall(){
                PhysicsScene.balls.pop();
            }

            function handleBallCollision(ball1, ball2, restitution){
                var dir = new Vector2();

                dir.subtractVectors(ball2.pos, ball1.pos);
                var d = dir.length();

                if (d == 0.0001 || d > ball1.radius + ball2.radius)
                return;
                
                dir.scale(1.0 / d);

                var corr = (ball1.radius + ball2.radius - d)/2.0;
                ball1.pos.add(dir, -corr);
                ball2.pos.add(dir, corr);

                var v1 = ball1.vel.dot(dir);
                var v2 = ball2.vel.dot(dir);

                var m1 = ball1.mass;
                var m2 = ball2.mass;

                var newv1 = (m1 * v1 + m2 * v2 - m2 * (v1 - v2) * restitution) / (m1 + m2);
                var newv2 = (m1 * v1 + m2 * v2 - m1 * (v1 - v2) * restitution) / (m1 + m2);

                ball1.vel.add(dir, newv1 - v1);
                ball2.vel.add(dir, newv2 - v2);
            }

            function handleWallCollision(ball, worldsize){
                if (ball.pos.x < ball.radius){
                    ball.pos.x = ball.radius;
                    ball.vel.x = -ball.vel.x;
                }

                if (ball.pos.y < ball.radius){
                    ball.pos.y = ball.radius;
                    ball.vel.y = -ball.vel.y;
                }

                if (ball.pos.x > worldsize.x -ball.radius){
                    ball.pos.x = worldsize.x - ball.radius;
                    ball.vel.x = -ball.vel.x;
                }

                if (ball.pos.y > worldsize.y -ball.radius){
                    ball.pos.y = worldsize.y - ball.radius;
                    ball.vel.y = -ball.vel.y;
                }

            }

            function simulate(){
                
                for (let i=0 ; i < PhysicsScene.balls.length; i++){
                    var ball1  = PhysicsScene.balls[i];
                    ball1.simulate(PhysicsScene.dt, PhysicsScene.gravity);

                    for (let j = 1 + i; j < PhysicsScene.balls.length; j++){
                        var ball2 = PhysicsScene.balls[j];
                        handleBallCollision(ball1, ball2, PhysicsScene.restitution);
                    }

                    handleWallCollision(ball1, PhysicsScene.worldsize);
                }
                
            }

            
            // Draw Simulate Update
            function draw(){
                ctx.clearRect(0,0, canvas.width, canvas.height);

                ctx.fillStyle = "#FF0000";

                for (let i = 0 ; i < PhysicsScene.balls.length; i++){
                    var ball = PhysicsScene.balls[i];
                    ctx.beginPath();
                    ctx.fillStyle ='hsl(' + ball.col + ', 50%, 50%)';
;
                    ctx.arc(
                        cX(ball.pos), cY(ball.pos), cScale * ball.radius, 0.0, 2.0 * Math.PI);
                    ctx.closePath();
                    ctx.fill();

                }
            }


            function update(){
                simulate();
                draw();
                requestAnimationFrame(update);
            }
            
            setupScene()
            update()

            const gSlider = document.getElementById("gRange");
            const gtext = document.getElementById("gtext");
            gSlider.addEventListener('input', function(){
                PhysicsScene.gravity.y = -this.value;
                gtext.textContent = -PhysicsScene.gravity.y;
            })

            const restSlider = document.getElementById("restRange");
            const restText = document.getElementById("restText");
            restSlider.addEventListener('input', function(){
                PhysicsScene.restitution = this.value;
                restText.textContent = PhysicsScene.restitution;
            })

            
            const addbtn = document.getElementById("addbtn");
            addbtn.addEventListener('click', addBall);

            const removebtn = document.getElementById("removebtn");
            removebtn.addEventListener('click', removeBall);