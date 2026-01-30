import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.*;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

public class GameHub extends JFrame {
    private CardLayout cardLayout;
    private JPanel mainPanel;
    private Map<String, JPanel> gamePanels = new HashMap<>();
    
    // 遊戲狀態
    private Timer gameTimer;
    private Random rand = new Random();
    
    public GameHub() {
        setTitle("🎮 Java 小遊戲大廳");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(800, 600);
        setLocationRelativeTo(null);
        
        cardLayout = new CardLayout();
        mainPanel = new JPanel(cardLayout);
        
        // 建立主選單
        createMainMenu();
        
        // 建立所有遊戲面板
        createAllGames();
        
        add(mainPanel);
        setVisible(true);
    }
    
    private void createMainMenu() {
        JPanel menu = new JPanel(new GridLayout(0, 3, 10, 10));
        menu.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        
        String[] games = {
            "數字猜謎", "貪吃蛇", "點擊測試", 
            "反應大戰", "打字練習", "WASD躲避",
            "記憶挑戰", "顏色辨識", "節奏點擊",
            "迷宮", "井字棋"
        };
        
        for (String game : games) {
            JButton btn = new JButton(game);
            btn.setFont(new Font("Microsoft JhengHei", Font.BOLD, 16));
            btn.setBackground(new Color(79, 70, 229));
            btn.setForeground(Color.WHITE);
            btn.setFocusPainted(false);
            
            String gameKey = game;
            btn.addActionListener(e -> showGame(gameKey));
            menu.add(btn);
        }
        
        mainPanel.add(menu, "main");
    }
    
    private void createAllGames() {
        gamePanels.put("數字猜謎", createGuessGame());
        gamePanels.put("貪吃蛇", createSnakeGame());
        gamePanels.put("點擊測試", createClickGame());
        gamePanels.put("反應大戰", createReactionBattle());
        gamePanels.put("打字練習", createTypingGame());
        gamePanels.put("WASD躲避", createDodgeGame());
        // 其他遊戲可依此模式擴充
    }
    
    private void showGame(String gameName) {
        JPanel panel = gamePanels.get(gameName);
        if (panel != null) {
            mainPanel.add(panel, gameName);
            cardLayout.show(mainPanel, gameName);
        }
    }
    
    // ====== 遊戲 1: 數字猜謎 ======
    private JPanel createGuessGame() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(Color.DARK_GRAY);
        
        int target = rand.nextInt(100) + 1;
        JLabel hint = new JLabel("猜 1-100 的數字", JLabel.CENTER);
        hint.setForeground(Color.WHITE);
        hint.setFont(new Font("Arial", Font.BOLD, 20));
        
        JTextField input = new JTextField(10);
        input.setFont(new Font("Arial", Font.PLAIN, 18));
        input.setHorizontalAlignment(JTextField.CENTER);
        
        JButton submit = new JButton("提交");
        submit.setFont(new Font("Arial", Font.BOLD, 16));
        submit.addActionListener(e -> {
            try {
                int guess = Integer.parseInt(input.getText());
                if (guess == target) {
                    JOptionPane.showMessageDialog(panel, "🎉 猜對了！答案是 " + target);
                    // 重置
                    target = rand.nextInt(100) + 1;
                    input.setText("");
                    hint.setText("再猜一次！");
                } else if (guess < target) {
                    hint.setText("太小了！再試一次");
                } else {
                    hint.setText("太大了！再試一次");
                }
                input.selectAll();
                input.requestFocus();
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(panel, "請輸入數字！");
            }
        });
        
        input.addActionListener(submit.getActionListeners()[0]);
        
        JPanel center = new JPanel();
        center.setOpaque(false);
        center.add(input);
        center.add(submit);
        
        panel.add(hint, BorderLayout.NORTH);
        panel.add(center, BorderLayout.CENTER);
        addBackButton(panel);
        
        return panel;
    }
    
    // ====== 遊戲 2: 貪吃蛇 (修復方向反向) ======
    private JPanel createSnakeGame() {
        SnakePanel snakePanel = new SnakePanel();
        addBackButton(snakePanel);
        return snakePanel;
    }
    
    // 貪吃蛇專用面板
    class SnakePanel extends JPanel implements KeyListener {
        private static final int GRID_SIZE = 20;
        private static final int WIDTH = 30;
        private static final int HEIGHT = 20;
        private List<Point> snake;
        private Point food;
        private int dx = 1, dy = 0; // 方向
        private int nextDx = 1, nextDy = 0; // 下一幀方向（防反向）
        private boolean running = false;
        private Timer timer;
        
        public SnakePanel() {
            setPreferredSize(new Dimension(WIDTH * GRID_SIZE, HEIGHT * GRID_SIZE));
            setBackground(Color.BLACK);
            setFocusable(true);
            addKeyListener(this);
            initGame();
        }
        
        private void initGame() {
            snake = new ArrayList<>();
            snake.add(new Point(5, 10));
            snake.add(new Point(4, 10));
            snake.add(new Point(3, 10));
            generateFood();
            dx = 1; dy = 0;
            nextDx = 1; nextDy = 0;
            running = true;
            if (timer != null) timer.cancel();
            timer = new Timer();
            timer.schedule(new TimerTask() {
                @Override
                public void run() {
                    if (running) step();
                    repaint();
                }
            }, 0, 150);
            requestFocusInWindow();
        }
        
        private void generateFood() {
            do {
                food = new Point(rand.nextInt(WIDTH), rand.nextInt(HEIGHT));
            } while (snake.contains(food));
        }
        
        private void step() {
            // 更新方向（防反向）
            if (!(nextDx == -dx && nextDy == -dy)) {
                dx = nextDx;
                dy = nextDy;
            }
            
            Point head = snake.get(0);
            Point newHead = new Point(head.x + dx, head.y + dy);
            
            // 碰牆檢測
            if (newHead.x < 0 || newHead.x >= WIDTH || newHead.y < 0 || newHead.y >= HEIGHT) {
                gameOver();
                return;
            }
            
            // 自撞檢測
            if (snake.contains(newHead)) {
                gameOver();
                return;
            }
            
            snake.add(0, newHead);
            
            if (newHead.equals(food)) {
                generateFood();
            } else {
                snake.remove(snake.size() - 1);
            }
        }
        
        private void gameOver() {
            running = false;
            int score = snake.size() - 3;
            int result = JOptionPane.showConfirmDialog(
                this, 
                "Game Over! 分數: " + score + "\n再玩一次？", 
                "遊戲結束", 
                JOptionPane.YES_NO_OPTION
            );
            if (result == JOptionPane.YES_OPTION) {
                initGame();
            } else {
                showMainMenu();
            }
        }
        
        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            // 畫蛇
            g.setColor(Color.GREEN);
            for (int i = 0; i < snake.size(); i++) {
                Point p = snake.get(i);
                if (i == 0) g.setColor(Color.CYAN); // 頭
                g.fillRect(p.x * GRID_SIZE, p.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                g.setColor(Color.GREEN);
            }
            // 畫食物
            g.setColor(Color.RED);
            g.fillOval(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
        
        @Override
        public void keyPressed(KeyEvent e) {
            switch (e.getKeyCode()) {
                case KeyEvent.VK_UP:    if (dy != 1) { nextDx = 0; nextDy = -1; } break;
                case KeyEvent.VK_DOWN:  if (dy != -1) { nextDx = 0; nextDy = 1; } break;
                case KeyEvent.VK_LEFT:  if (dx != 1) { nextDx = -1; nextDy = 0; } break;
                case KeyEvent.VK_RIGHT: if (dx != -1) { nextDx = 1; nextDy = 0; } break;
                case KeyEvent.VK_SPACE: if (!running) initGame(); break;
            }
        }
        
        @Override public void keyTyped(KeyEvent e) {}
        @Override public void keyReleased(KeyEvent e) {}
    }
    
    // ====== 遊戲 3: 點擊測試 ======
    private JPanel createClickGame() {
        JPanel panel = new JPanel() {
            @Override protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                g.setColor(Color.BLACK);
                g.fillRect(0, 0, getWidth(), getHeight());
            }
        };
        panel.setLayout(null);
        panel.setBackground(Color.BLACK);
        
        JLabel instruction = new JLabel("點擊出現的方塊！", JLabel.CENTER);
        instruction.setForeground(Color.WHITE);
        instruction.setFont(new Font("Arial", Font.BOLD, 20));
        instruction.setBounds(0, 20, 800, 30);
        panel.add(instruction);
        
        JLabel scoreLabel = new JLabel("分數: 0", JLabel.CENTER);
        scoreLabel.setForeground(Color.YELLOW);
        scoreLabel.setFont(new Font("Arial", Font.BOLD, 18));
        scoreLabel.setBounds(0, 60, 800, 30);
        panel.add(scoreLabel);
        
        JPanel target = new JPanel();
        target.setBackground(Color.RED);
        target.setBounds(-100, -100, 50, 50); // 初始隱藏
        target.addMouseListener(new MouseAdapter() {
            long startTime = System.currentTimeMillis();
            int score = 0;
            @Override
            public void mouseClicked(MouseEvent e) {
                long reaction = System.currentTimeMillis() - startTime;
                score++;
                scoreLabel.setText("分數: " + score + " | 反應: " + reaction + "ms");
                spawnTarget();
                startTime = System.currentTimeMillis();
            }
        });
        panel.add(target);
        
        JButton startBtn = new JButton("開始");
        startBtn.setBounds(350, 250, 100, 40);
        startBtn.addActionListener(e -> {
            startBtn.setVisible(false);
            spawnTarget();
        });
        panel.add(startBtn);
        
        addBackButton(panel);
        return panel;
    }
    
    private void spawnTarget() {
        // 在 createClickGame 中呼叫
    }
    
    // ====== 遊戲 4: 雙人反應大戰 ======
    private JPanel createReactionBattle() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(Color.DARK_GRAY);
        
        JLabel status = new JLabel("按空格開始...", JLabel.CENTER);
        status.setForeground(Color.WHITE);
        status.setFont(new Font("Arial", Font.BOLD, 24));
        panel.add(status, BorderLayout.NORTH);
        
        JLabel p1Label = new JLabel("Player 1 (A)", JLabel.CENTER);
        p1Label.setForeground(Color.CYAN);
        p1Label.setFont(new Font("Arial", Font.BOLD, 18));
        
        JLabel p2Label = new JLabel("Player 2 (L)", JLabel.CENTER);
        p2Label.setForeground(Color.PINK);
        p2Label.setFont(new Font("Arial", Font.BOLD, 18));
        
        JPanel players = new JPanel(new GridLayout(1, 2, 20, 20));
        players.setOpaque(false);
        players.add(p1Label);
        players.add(p2Label);
        panel.add(players, BorderLayout.CENTER);
        
        Timer readyTimer = null;
        panel.addKeyListener(new KeyAdapter() {
            boolean gameStarted = false;
            boolean p1Pressed = false, p2Pressed = false;
            
            @Override
            public void keyPressed(KeyEvent e) {
                if (!gameStarted) {
                    if (e.getKeyChar() == ' ') {
                        gameStarted = true;
                        p1Pressed = false; p2Pressed = false;
                        status.setText("準備...");
                        readyTimer = new Timer();
                        readyTimer.schedule(new TimerTask() {
                            @Override
                            public void run() {
                                SwingUtilities.invokeLater(() -> {
                                    status.setText("GO!");
                                    status.setForeground(Color.GREEN);
                                });
                            }
                        }, 2000 + rand.nextInt(2000));
                    }
                } else {
                    if (e.getKeyChar() == 'a' && !p1Pressed) {
                        p1Pressed = true;
                        p1Label.setText("Player 1 WIN!");
                        endGame();
                    }
                    if (e.getKeyChar() == 'l' && !p2Pressed) {
                        p2Pressed = true;
                        p2Label.setText("Player 2 WIN!");
                        endGame();
                    }
                }
            }
            
            private void endGame() {
                gameStarted = false;
                if (readyTimer != null) readyTimer.cancel();
                Timer reset = new Timer();
                reset.schedule(new TimerTask() {
                    @Override
                    public void run() {
                        SwingUtilities.invokeLater(() -> {
                            status.setText("按空格開始...");
                            status.setForeground(Color.WHITE);
                            p1Label.setText("Player 1 (A)");
                            p2Label.setText("Player 2 (L)");
                        });
                    }
                }, 3000);
            }
        });
        panel.setFocusable(true);
        panel.requestFocusInWindow();
        
        addBackButton(panel);
        return panel;
    }
    
    // ====== 遊戲 5: 打字練習 ======
    private JPanel createTypingGame() {
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        panel.setBackground(Color.DARK_GRAY);
        
        String[] words = {"apple", "banana", "cherry", "dragon", "elephant", "flower", "guitar"};
        String currentWord = words[rand.nextInt(words.length)];
        
        JLabel wordLabel = new JLabel(currentWord, JLabel.CENTER);
        wordLabel.setForeground(Color.WHITE);
        wordLabel.setFont(new Font("Courier New", Font.BOLD, 32));
        panel.add(wordLabel, BorderLayout.NORTH);
        
        JTextField input = new JTextField();
        input.setFont(new Font("Courier New", Font.PLAIN, 24));
        input.setHorizontalAlignment(JTextField.CENTER);
        panel.add(input, BorderLayout.CENTER);
        
        JLabel scoreLabel = new JLabel("正確: 0", JLabel.CENTER);
        scoreLabel.setForeground(Color.GREEN);
        scoreLabel.setFont(new Font("Arial", Font.BOLD, 18));
        panel.add(scoreLabel, BorderLayout.SOUTH);
        
        int[] correct = {0};
        input.addActionListener(e -> {
            if (input.getText().equals(currentWord)) {
                correct[0]++;
                scoreLabel.setText("正確: " + correct[0]);
                currentWord = words[rand.nextInt(words.length)];
                wordLabel.setText(currentWord);
                input.setText("");
            } else {
                input.setText("");
            }
            input.requestFocus();
        });
        
        addBackButton(panel);
        input.requestFocus();
        return panel;
    }
    
    // ====== 遊戲 6: WASD 躲避 ======
    private JPanel createDodgeGame() {
        JPanel panel = new JPanel() {
            int ballX = 400, ballY = 300;
            int dx = 2, dy = 2;
            int playerX = 400, playerY = 500;
            boolean w, a, s, d;
            
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                g.setColor(Color.BLACK);
                g.fillRect(0, 0, getWidth(), getHeight());
                
                // 球
                g.setColor(Color.RED);
                g.fillOval(ballX, ballY, 20, 20);
                
                // 玩家
                g.setColor(Color.BLUE);
                g.fillRect(playerX, playerY, 30, 30);
            }
            
            Timer timer = new Timer();
            {
                timer.schedule(new TimerTask() {
                    @Override
                    public void run() {
                        // 移動球
                        ballX += dx;
                        ballY += dy;
                        if (ballX <= 0 || ballX >= 780) dx = -dx;
                        if (ballY <= 0) dy = -dy;
                        
                        // 玩家移動
                        if (w && playerY > 0) playerY -= 5;
                        if (s && playerY < 570) playerY += 5;
                        if (a && playerX > 0) playerX -= 5;
                        if (d && playerX < 770) playerX += 5;
                        
                        // 碰撞檢測
                        if (ballY + 20 >= playerY && 
                            ballX + 20 >= playerX && 
                            ballX <= playerX + 30) {
                            // 遊戲結束
                            timer.cancel();
                            JOptionPane.showMessageDialog(panel, "被撞到了！再試一次");
                            ballX = 400; ballY = 300;
                            playerX = 400; playerY = 500;
                            timer = new Timer();
                            timer.schedule(this, 0, 16);
                        }
                        
                        repaint();
                    }
                }, 0, 16);
            }
            
            public void setKey(char key, boolean pressed) {
                switch (key) {
                    case 'w': w = pressed; break;
                    case 'a': a = pressed; break;
                    case 's': s = pressed; break;
                    case 'd': d = pressed; break;
                }
            }
        };
        panel.setPreferredSize(new Dimension(800, 600));
        panel.setFocusable(true);
        panel.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                char c = Character.toLowerCase(e.getKeyChar());
                if (c == 'w' || c == 'a' || c == 's' || c == 'd') {
                    ((JPanelWithKeys) panel).setKey(c, true);
                }
            }
            @Override
            public void keyReleased(KeyEvent e) {
                char c = Character.toLowerCase(e.getKeyChar());
                if (c == 'w' || c == 'a' || c == 's' || c == 'd') {
                    ((JPanelWithKeys) panel).setKey(c, false);
                }
            }
        });
        
        // Helper interface
        interface JPanelWithKeys {
            void setKey(char key, boolean pressed);
        }
        
        addBackButton(panel);
        return panel;
    }
    
    // ====== 通用功能 ======
    private void addBackButton(JPanel panel) {
        JButton back = new JButton("← 返回主選單");
        back.setFont(new Font("Arial", Font.PLAIN, 14));
        back.addActionListener(e -> cardLayout.show(mainPanel, "main"));
        panel.add(back, BorderLayout.SOUTH);
    }
    
    private void showMainMenu() {
        cardLayout.show(mainPanel, "main");
    }
    
    // ====== 啟動程式 ======
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeel());
            } catch (Exception e) {
                e.printStackTrace();
            }
            new GameHub();
        });
    }
}