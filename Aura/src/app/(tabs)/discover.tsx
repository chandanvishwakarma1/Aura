import { View, Text, TextInput, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, RefreshControl, Pressable } from 'react-native'
import React, { useMemo, useState } from 'react'
import { Dot, Search, Trophy, UserCheck } from 'lucide-react-native'
import { useAuthStore } from '../../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { LineChart } from 'react-native-gifted-charts'
import { Href, useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'
import { Colors } from '@/constants/Colors'

interface Profile {
  winRate: number | null,
  followCount: number,
  _id: string,
  profileImage: string,
  shortIntro: string,
  name: string,
  description: string,
  type: string,
  instrumentScope: string | string[],
  active: boolean,
}
interface ChartData {
  date: string,
  value: number
}

const fetchProfiles = async (token: string | null): Promise<Profile[]> => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Failed to fetch profiles')
  return data
}

const fetchReturns = async (profileId: string, token: string | null): Promise<ChartData[]> => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile/${profileId}/returns`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  if (!response.ok) throw new Error('Failed to load chart data')
  const json = await response.json()
  return json.data
}

const ProfileItem = ({ item }: { item: Profile }) => {
  const router = useRouter()
  const { token } = useAuthStore()

  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'
  const { data: chartData = [], isLoading: isChartLoading } = useQuery({
    queryKey: ['profileReturns', item._id, '1M'],
    queryFn: () => fetchReturns(item._id, token),
    enabled: !!item._id && !!token,
    staleTime: 1000 * 60 * 15
  })

  const hasData = chartData && chartData.length > 0

  const latestReturns = hasData ? chartData[chartData.length - 1].value : 0
  const isPositive = latestReturns >= 0

  // Compute chart bounds with padding to avoid zero-range rendering issues
  const values = hasData ? chartData.map(d => d.value) : [0]
  const rawMax = Math.max(...values, 0)
  const rawMin = Math.min(...values, 0)
  const range = rawMax - rawMin
  const maxValue = range === 0 ? rawMax + 1 : rawMax + range * 0.1
  const mostNegativeValue = range === 0 ? rawMin - 1 : rawMin - range * 0.1

  const handlePress = () => {
    const id = item._id
    router.navigate(`/(profile)/${id}` as Href)
  }


  return (
    <Pressable
      onPress={handlePress}
      className='flex-row w-full bg-aura-surface dark:bg-aura-surface-dark rounded-3xl py-6 px-4 active:opacity-70'
    >
      <View className='flex-1 justify-center pr-4'>
        <View className='flex-row items-center gap-3 overflow-hidden'>
          <View className='w-14 h-14 rounded-full overflow-hidden shrink-0'>
            <Image
              source={item.profileImage ? { uri: item.profileImage } : undefined}
              style={{ width: '100%', height: '100%', borderRadius: 100 }}
              contentFit='cover'
            />
          </View>

          <View className='flex-1 justify-center gap-1 overflow-hidden'>
            <Text className='text-lg font-aura-bold  text-aura-text-primary dark:text-aura-text-primary-dark' numberOfLines={1}>{item.name}</Text>
            <Text numberOfLines={1} className='text-sm text-aura-text-secondary dark:text-aura-text-secondary-dark font-aura-regular'>{item.shortIntro}</Text>
          </View>
        </View>

        <View className='flex-row items-center mt-4 pl-4'>
          <View className='flex-row items-center justify-center gap-2'>
            <UserCheck color={isDark ? Colors.dark.textMuted : Colors.light.textMuted} size={19} />
            <Text className='font-semibold text-base text-aura-text-secondary dark:text-aura-text-secondary-dark'>{item.followCount ?? 0}</Text>
          </View>
          <Dot color={'#9ca3af'} />
          <View className='flex-row items-center justify-center gap-2'>
            <Trophy color={isDark ? Colors.dark.textMuted : Colors.light.textMuted} size={17} />
            <Text className='font-semibold text-base text-aura-text-secondary dark:text-aura-text-secondary-dark'>{item.winRate != null ? `${item.winRate.toFixed(2)}%` : '—'}</Text>
          </View>
        </View>
      </View>

      <View className='justify-between items-center gap-3'>
        <View className={`flex-row p-1 rounded-lg ${isPositive ? 'bg-aura-positive/10' : 'bg-aura-negative/10'}`}>
          <Text className={`text-sm font-bold ${isPositive ? 'text-aura-positive' : 'text-aura-negative'}`}>
            {isPositive ? '+' : ''}{latestReturns.toFixed(2)}%
          </Text>
          <Text className={`text-sm ${isPositive ? 'text-aura-positive' : 'text-aura-negative'}`}>(30d)</Text>
        </View>

        {isChartLoading ? (
          <View className='h-8 w-[84px] items-center justify-center bg-aura-bg dark:bg-aura-bg-dark'>
            <ActivityIndicator size='small' color={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary} />
          </View>
        ) : chartData.length > 0 ? (
          <LineChart
            data={chartData}
            mostNegativeValue={mostNegativeValue}
            maxValue={maxValue}
            yAxisLabelWidth={0}
            height={30}
            width={84}
            yAxisExtraHeight={0}
            xAxisIndicesHeight={0}
            xAxisTextNumberOfLines={0}
            xAxisLabelsHeight={0}
            yAxisOffset={0}
            xAxisThickness={0}
            yAxisThickness={0}
            overflowBottom={4}
            overflowTop={4}
            adjustToWidth
            areaChart
            hideAxesAndRules
            hideDataPoints
            hideRules
            hideYAxisText
            initialSpacing={0}
            endSpacing={0}
            thickness={2}
            color={isPositive ? Colors.dark.positive : Colors.light.negative}
            startFillColor={isPositive ? 'rgba(5, 177, 105, 0.35)' : 'rgba(207, 32, 47, 0.35)'}
            endFillColor={isPositive ? 'rgba(5, 177, 105, 0)' : 'rgba(207, 32, 47, 0)'}
            startOpacity={0.4}
            endOpacity={0}
            curved
            disableScroll
          />
        ) : (
          <View className='h-8 w-[84px] items-center justify-center'>
            <Text className='text-xs text-aura-text-secondary dark:text-aura-text-secondary-dark'>No data</Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}

const Pending = () => {

  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
      }}
    >
      <ActivityIndicator size={'large'} color={isDark ? Colors.light.textPrimary : Colors.dark.textPrimary} />
    </View>
  )
}

const Discover = () => {
  const { token } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'

  const { data: profiles = [], isPending, error, refetch, isRefetching } = useQuery({
    queryKey: ['profiles', token],
    queryFn: () => fetchProfiles(token),
    enabled: !!token
  })

  const filteredProfiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return profiles
    return profiles.filter((profile) => {
      const searchable = [
        profile.name,
        profile.shortIntro,
        profile.description,
        profile.type,
        ...(Array.isArray(profile.instrumentScope) ? profile.instrumentScope : [profile.instrumentScope])
      ].filter(Boolean).join(' ').toLowerCase()
      return searchable.includes(query)
    })
  }, [profiles, searchQuery])

  if (isPending) {
    return <Pending />
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View className='flex-1 mx-6'>
        <View>
          <View className='mt-4'>
            <Text className='text-3xl font-bold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Explore Strategies</Text>
          </View>
          <View className={`flex-row border bg-aura-surface dark:bg-aura-surface-dark rounded-full items-center px-3 mt-3 gap-1 ${isFocused ? 'border-aura-primary dark:border-aura-primary' : ''}`}>
            <Search color={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder='Search profiles...'
              placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
              className='flex-1 text-base py-2 text-aura-text-primary dark:text-aura-text-primary-dark'
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoCorrect={false}
              autoCapitalize='none'
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Text className='text-aura-text-secondary dark:text-aura-text-secondary-dark text-lg px-1'>✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        {error ? (
          <View className='flex-1 items-center justify-center gap-4'>
            <Text className='text-aura-text-secondary dark:text-aura-text-secondary-dark text-base'>Failed to load profiles</Text>
            <Pressable
              onPress={() => refetch()}
              className='bg-aura-bg-dark dark:bg-aura-bg px-6 py-3 rounded-2xl'
            >
              <Text className='text-aura-text-primary-dark dark:text-aura-text-primary font-semibold'>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredProfiles}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <ProfileItem item={item} />}
            contentContainerStyle={{ paddingBottom: 40, paddingTop: 16, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            ListEmptyComponent={
              <View className='flex-1 items-center justify-center pt-20'>
                <Text className='text-aura-text-secondary dark:text-aura-text-secondary-dark text-base'>
                  {searchQuery ? 'No profiles match your search' : 'No Profiles Yet.'}
                </Text>
              </View>
            }
            ItemSeparatorComponent={() => <View className='h-4' />}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={isDark ? Colors.light.primary : Colors.dark.primary}
                colors={[isDark ? Colors.light.primary : Colors.dark.primary]}
              />
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

export default Discover