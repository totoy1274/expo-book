import Color from "color";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  SharedValue,
  clamp,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

const PAGE_WIDTH = 100;
const PAGE_HEIGHT = 1.3 * PAGE_WIDTH;
const PAGE_COLOR = "#F5E6C8";
const LIGHT_PAGE_COLOR = Color(PAGE_COLOR).darken(0.6).string();
const DARK_PAGE_COLOR = Color(PAGE_COLOR).darken(0.2).string();
const COVER_COLOR = Color("#A66F7A").darken(0.8).string();
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Index() {
  const value = useSharedValue(0);
  const panGesture = Gesture.Pan().onChange((event) => {
    value.value -= event.changeX;
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <View style={{ transform: [{ translateX: PAGE_WIDTH / 2 }] }}>
          {Array.from({ length: 11 }).map((_, index) => (
            <Check
              key={index}
              index={index}
              value={value}
              isFirst={index === 0}
              isLast={index === 10}
            />
          ))}
        </View>
      </View>
    </GestureDetector>
  );
}

const Check = ({
  index,
  value,
  isFirst,
  isLast,
}: {
  index: number;
  value: SharedValue<number>;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const updatedValue = useDerivedValue(() => {
    return value.value;
  });
  const animatedStyle = useAnimatedStyle(() => {
    const pageTilt = clamp(90 * index * 0.2, 0, 180);
    const rotateY = interpolate(
      updatedValue.value % SCREEN_WIDTH,
      [0, SCREEN_WIDTH * 0.125, SCREEN_WIDTH * 0.25],
      [0, pageTilt, 180],
      Extrapolation.CLAMP
    );

    const pageColor = interpolateColor(
      rotateY,
      [0, 45, 90, 135, 180],
      [
        LIGHT_PAGE_COLOR,
        DARK_PAGE_COLOR,
        PAGE_COLOR,
        DARK_PAGE_COLOR,
        LIGHT_PAGE_COLOR,
      ]
    );

    return {
      backgroundColor: isFirst || isLast ? COVER_COLOR : pageColor,
      transform: [
        { perspective: 1000 },
        { translateX: -PAGE_WIDTH / 2 },
        { rotateX: `20deg` },
        { rotateY: `-${rotateY}deg` },
        { translateX: PAGE_WIDTH / 2 },
      ],
    };
  });

  return <Animated.View style={[styles.page, animatedStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  page: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    position: "absolute",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    boxShadow: `10px 10px 10px 1px rgba(0, 0, 0, 0.05)`,
  },
});
