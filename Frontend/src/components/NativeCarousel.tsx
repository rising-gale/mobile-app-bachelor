import { useState } from "react";
import { FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";

// ЛЕГКИЙ НАТИВНЫЙ КОМПОНЕНТ КАРУСЕЛИ
interface NativeCarouselProps {
  data: any[];
  width: number;
  height: number;
  resizeMode?: 'cover' | 'contain';
}

const NativeCarousel: React.FC<NativeCarouselProps> = ({ data, width, height, resizeMode = 'cover' }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    setActiveIndex(index);
  };

  return (
    <View style={{ width, height }} className="items-center justify-center">
      <FlatList
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ width, height }} className="px-1">
            <View className="w-full h-full rounded-2xl overflow-hidden bg-slate-900/40 border border-slate-800/60">
              <Image source={item} className="w-full h-full" resizeMode={resizeMode} />
            </View>
          </View>
        )}
      />
      {/* Индикаторы страниц (Dots) */}
      <View className="flex-row gap-1.5 mt-3 justify-center items-center h-2">
        {data.map((_, index) => (
          <View
            key={index}
            className={`rounded-full transition-all duration-200 ${
              activeIndex === index ? 'w-5 h-1.5 bg-emerald-500' : 'w-1.5 h-1.5 bg-slate-600'
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default NativeCarousel;