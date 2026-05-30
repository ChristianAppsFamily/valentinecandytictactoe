import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AdBanner from '@/components/AdBanner';
import Colors from '@/constants/colors';
import { useActiveTheme } from '@/contexts/AppContext';
import { useInterstitialAd } from '@/hooks/useInterstitialAd';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 40, 340);
const CELL_SIZE = Math.floor((BOARD_SIZE - 20) / 3);

type Player = 'X' | 'O' | null;
type Board = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  isRed: boolean;
}

interface ConfettiHeart {
  id: number;
  x: number;
  startY: number;
  size: number;
  rotation: number;
  delay: number;
}

const generateFloatingHearts = (): FloatingHeart[] => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * (width - 60),
    y: Math.random() * 800,
    size: 20 + Math.random() * 40,
    opacity: 0.3 + Math.random() * 0.4,
    isRed: Math.random() > 0.6,
  }));
};

export default function ValentineTicTacToe() {
  const router = useRouter();
  const theme = useActiveTheme();
  const { showInterstitial } = useInterstitialAd();
  const insets = useSafeAreaInsets();
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [floatingHearts] = useState(generateFloatingHearts);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiAnimations = useRef<Animated.Value[]>([]).current;
  const confettiHearts = useRef<ConfettiHeart[]>([]).current;
  
  const cellAnimations = useRef(
    Array.from({ length: 9 }, () => new Animated.Value(0))
  ).current;
  
  const bounceAnimation = useRef(new Animated.Value(1)).current;
  const titleAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(titleAnimation, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [titleAnimation]);

  const checkWinner = useCallback((currentBoard: Board): Player => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        setWinningLine(combo);
        return currentBoard[a];
      }
    }
    return null;
  }, []);

  const triggerConfetti = useCallback(() => {
    confettiHearts.length = 0;
    confettiAnimations.length = 0;
    
    const heartsCount = 30;
    for (let i = 0; i < heartsCount; i++) {
      confettiHearts.push({
        id: i,
        x: Math.random() * (width - 40) + 20,
        startY: -50 - Math.random() * 100,
        size: 15 + Math.random() * 25,
        rotation: Math.random() * 360,
        delay: Math.random() * 500,
      });
      confettiAnimations.push(new Animated.Value(0));
    }
    
    setShowConfetti(true);
    
    const animations = confettiAnimations.map((anim, i) =>
      Animated.sequence([
        Animated.delay(confettiHearts[i].delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000 + Math.random() * 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    
    Animated.parallel(animations).start(() => {
      setTimeout(() => setShowConfetti(false), 500);
    });
  }, [confettiHearts, confettiAnimations]);

  const handleCellPress = useCallback(
    (index: number) => {
      if (board[index] || winner || isDraw) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Animated.sequence([
        Animated.timing(cellAnimations[index], {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(cellAnimations[index], {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      setBoard(newBoard);

      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        triggerConfetti();
        void showInterstitial();
      } else if (newBoard.every((cell) => cell !== null)) {
        setIsDraw(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      }
    },
    [board, currentPlayer, winner, isDraw, checkWinner, cellAnimations, triggerConfetti, showInterstitial]
  );

  const resetGame = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowConfetti(false);
    
    Animated.sequence([
      Animated.timing(bounceAnimation, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnimation, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    cellAnimations.forEach((anim) => anim.setValue(0));
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
  }, [bounceAnimation, cellAnimations]);

  const renderHeartX = (isWinning: boolean) => (
    <View style={[styles.heartContainer, isWinning && styles.winningPiece]}>
      <View style={styles.redHeart}>
        <View style={styles.heartShape}>
          <View style={[styles.heartLeft, styles.heartLeftRed]} />
          <View style={[styles.heartRight, styles.heartRightRed]} />
        </View>
        <Text style={styles.heartText}>X</Text>
      </View>
    </View>
  );

  const renderHeartO = (isWinning: boolean) => (
    <View style={[styles.heartContainer, isWinning && styles.winningPiece]}>
      <View style={styles.pinkHeart}>
        <View style={styles.heartShape}>
          <View style={[styles.heartLeft, styles.heartLeftPink]} />
          <View style={[styles.heartRight, styles.heartRightPink]} />
        </View>
        <Text style={styles.heartTextO}>O</Text>
      </View>
    </View>
  );

  const renderCell = (index: number) => {
    const value = board[index];
    const isWinning = winningLine?.includes(index) || false;
    const scale = cellAnimations[index];

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.cell,
          { backgroundColor: theme.cellBg },
          index % 3 !== 2 && styles.cellBorderRight,
          index % 3 !== 2 && { borderRightColor: theme.boardBorder },
          index < 6 && styles.cellBorderBottom,
          index < 6 && { borderBottomColor: theme.boardBorder },
        ]}
        onPress={() => handleCellPress(index)}
        activeOpacity={0.7}
        testID={`cell-${index}`}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          {value === 'X' && renderHeartX(isWinning)}
          {value === 'O' && renderHeartO(isWinning)}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const getStatusText = () => {
    if (winner) {
      return "💕 You've Won My Heart! 💕";
    }
    if (isDraw) {
      return "💕 It's a Draw!";
    }
    return `${currentPlayer === 'X' ? '❤️' : '💗'} ${currentPlayer === 'X' ? 'Red Heart' : 'Pink Heart'}'s Turn`;
  };

  const renderConfettiHeart = (heart: ConfettiHeart, index: number) => {
    const anim = confettiAnimations[index];
    if (!anim) return null;
    
    const translateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [heart.startY, 800],
    });
    
    const rotate = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [`${heart.rotation}deg`, `${heart.rotation + 360}deg`],
    });
    
    const opacity = anim.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [1, 1, 0],
    });
    
    const scale = heart.size / 30;
    
    return (
      <Animated.View
        key={heart.id}
        style={[
          styles.confettiHeart,
          {
            left: heart.x,
            transform: [
              { translateY },
              { rotate },
              { scale },
            ],
            opacity,
          },
        ]}
      >
        <View style={styles.miniHeartShape}>
          <View style={[styles.miniHeartLeft, { backgroundColor: '#FF69B4' }]} />
          <View style={[styles.miniHeartRight, { backgroundColor: '#FFB6C1' }]} />
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={theme.background}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      {floatingHearts.map((heart) => (
        <View
          key={heart.id}
          style={[
            styles.floatingHeart,
            {
              left: heart.x,
              top: heart.y,
              opacity: heart.opacity,
            },
          ]}
        >
          <View style={[styles.miniHeartShape, { transform: [{ scale: heart.size / 30 }] }]}>
            <View style={[
              styles.miniHeartLeft,
              { backgroundColor: heart.isRed ? Colors.heart.red : Colors.heart.pinkLight }
            ]} />
            <View style={[
              styles.miniHeartRight,
              { backgroundColor: heart.isRed ? Colors.heart.red : Colors.heart.pinkLight }
            ]} />
          </View>
        </View>
      ))}

      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
          activeOpacity={0.8}
          testID="settings-button"
        >
          <Text style={[styles.settingsButtonText, { color: theme.title }]}>⚙ Settings</Text>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.titleContainer,
            {
              transform: [
                { scale: titleAnimation },
                {
                  translateY: titleAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.title }]}>Tic Tac Toe:</Text>
          <Text style={[styles.titleBig, { color: theme.title }]}>Valentines Day</Text>
        </Animated.View>

        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: theme.title }]}>{getStatusText()}</Text>
        </View>

        <View style={styles.boardContainer}>
          <View style={styles.boardShadow} />
          <View style={[styles.board, { borderColor: theme.boardBorder }]}>
            <View style={styles.row}>
              {renderCell(0)}
              {renderCell(1)}
              {renderCell(2)}
            </View>
            <View style={styles.row}>
              {renderCell(3)}
              {renderCell(4)}
              {renderCell(5)}
            </View>
            <View style={styles.row}>
              {renderCell(6)}
              {renderCell(7)}
              {renderCell(8)}
            </View>
          </View>
        </View>

        {showConfetti && (
          <View style={styles.confettiContainer} pointerEvents="none">
            {confettiHearts.map((heart, index) => renderConfettiHeart(heart, index))}
          </View>
        )}

        <Animated.View style={{ transform: [{ scale: bounceAnimation }] }}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetGame}
            activeOpacity={0.8}
            testID="reset-button"
          >
            <View style={styles.resetButtonGradient}>
              <Text style={styles.resetButtonText}>New Game</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.legendHeart}>
              <View style={styles.miniHeartShape}>
                <View style={[styles.miniHeartLeft, { backgroundColor: Colors.heart.red }]} />
                <View style={[styles.miniHeartRight, { backgroundColor: Colors.heart.red }]} />
              </View>
            </View>
            <Text style={styles.legendText}>Player X</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendHeart}>
              <View style={styles.miniHeartShape}>
                <View style={[styles.miniHeartLeft, { backgroundColor: Colors.heart.pinkLight }]} />
                <View style={[styles.miniHeartRight, { backgroundColor: Colors.heart.pinkLight }]} />
              </View>
            </View>
            <Text style={styles.legendText}>Player O</Text>
          </View>
        </View>
      </View>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  settingsButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  floatingHeart: {
    position: 'absolute',
  },
  miniHeartShape: {
    width: 30,
    height: 30,
    position: 'relative',
  },
  miniHeartLeft: {
    position: 'absolute',
    width: 15,
    height: 24,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    left: 0,
    top: 0,
    transform: [{ rotate: '-45deg' }],
  },
  miniHeartRight: {
    position: 'absolute',
    width: 15,
    height: 24,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    right: 0,
    top: 0,
    transform: [{ rotate: '45deg' }],
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text.title,
    letterSpacing: 2,
  },
  titleBig: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.text.title,
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.title,
  },
  boardContainer: {
    position: 'relative',
    marginBottom: 30,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardShadow: {
    position: 'absolute',
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  board: {
    width: BOARD_SIZE,
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 4,
    borderWidth: 4,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    margin: 2,
    borderRadius: 8,
  },
  cellBorderRight: {
    borderRightWidth: 4,
  },
  cellBorderBottom: {
    borderBottomWidth: 4,
  },
  heartContainer: {
    width: CELL_SIZE - 20,
    height: CELL_SIZE - 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  winningPiece: {
    transform: [{ scale: 1.1 }],
  },
  redHeart: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinkHeart: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartShape: {
    width: 60,
    height: 60,
    position: 'absolute',
  },
  heartLeft: {
    position: 'absolute',
    width: 35,
    height: 55,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    left: -2,
    top: 5,
    transform: [{ rotate: '-45deg' }],
  },
  heartRight: {
    position: 'absolute',
    width: 35,
    height: 55,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    right: -2,
    top: 5,
    transform: [{ rotate: '45deg' }],
  },
  heartLeftRed: {
    backgroundColor: Colors.heart.red,
    shadowColor: '#8B0000',
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  heartRightRed: {
    backgroundColor: Colors.heart.redLight,
    shadowColor: '#8B0000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  heartLeftPink: {
    backgroundColor: Colors.heart.pink,
    shadowColor: '#FF69B4',
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  heartRightPink: {
    backgroundColor: Colors.heart.pinkLight,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  heartText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    zIndex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heartTextO: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.primary,
    zIndex: 1,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  resetButton: {
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  resetButtonGradient: {
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 50,
    backgroundColor: '#8B0000',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  confettiHeart: {
    position: 'absolute',
    top: 0,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginTop: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendHeart: {
    width: 30,
    height: 30,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.title,
  },
});
