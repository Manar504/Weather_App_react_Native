import { View, Text, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline'
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid'
import { debounce } from "lodash";
import { theme } from '../theme/index';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import * as Progress from 'react-native-progress';
import { StatusBar } from 'expo-status-bar';
import { weatherImages } from '../constants/index';
import { getData, storeData } from '../utils/asyncStorage';

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState();
  const [weather, setWeather] = useState({})


  const handleSearch = search=>{
    // console.log('value: ',search);
    if(search && search.length>2)
      fetchLocations({cityName: search}).then(data=>{
        // console.log('got locations: ',data);
        setLocations(data);
      })
  }

  const handleLocation = loc=>{
    setLoading(true);
    toggleSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data=>{
      setLoading(false);
      setWeather(data);
      storeData('city',loc.name);
    })
  }

  useEffect(()=>{
    fetchMyWeatherData();
  },[]);

  const fetchMyWeatherData = async ()=>{
    let myCity = await getData('city');
    let cityName = 'Islamabad';
    if(myCity){
      cityName = myCity;
    }
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data=>{
      // console.log('got data: ',data.forecast.forecastday);
      setWeather(data);
      setLoading(false);
    })
    
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const {location, current} = weather;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Image
  blurRadius={70}
  source={require('../../assets/images/bg.png')}
  style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
/>
{loading ? (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
  </View>
          ):(
            <SafeAreaView style={{ flex: 1 }}>
              {/* search section */}
              <View style={{height: '7%' ,margin:"4", position:"relative", zIndex: 50 }} />
              <View style={{ height: '7%', marginHorizontal: 16, zIndex: 50 }}>
  <View style={{ backgroundColor: showSearch ? 'rgba(255,255,255,0.2)' : 'transparent' }}>
    {showSearch ? (
      <TextInput
        onChangeText={handleTextDebounce}
        placeholder="Search city"
        placeholderTextColor="lightgray"
        style={{ color: 'white' }}
      />
    ) : null}
    <TouchableOpacity
      onPress={() => toggleSearch(!showSearch)}
      style={{ backgroundColor: showSearch ? 'rgba(255,255,255,0.3)' : 'transparent' }}
    >
      {showSearch ? (
        <XMarkIcon size={25} color="white" />
      ) : (
        <MagnifyingGlassIcon size={25} color="white" />
      )}
    </TouchableOpacity>
  </View>
  {locations.length > 0 && showSearch ? (
    <View>
      {locations.map((loc, index) => {
        const showBorder = index + 1 !== locations.length;
        const borderStyle = showBorder ? { borderBottomWidth: 2, borderBottomColor: 'gray' } : {};
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleLocation(loc)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 8,
              paddingHorizontal: 16,
              marginBottom: 4,
              ...borderStyle
            }}
          >
            <MapPinIcon size={20} color="gray" />
            <Text style={{ color: 'black', fontSize: 16, marginLeft: 8 }}>{loc?.name}, {loc?.country}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  ) : null}
</View>

<View>
  <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 16 }}>
    {location?.name},
    <Text style={{ fontSize: 18, fontWeight: '600', color: '#888888' }}> {location?.country}</Text>
  </Text>
  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
    <Image
      source={weatherImages[current?.condition?.text || 'other']}
      style={{ width: 208, height: 208 }}
    />
  </View>
  <View style={{ marginTop: 16 }}>
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 60, fontWeight: 'bold', marginLeft: 20 }}>
        {current?.temp_c}&#176;
      </Text>
      <Text style={{ color: 'white', fontSize: 24, textAlign: 'center', letterSpacing: 1 }}>
        {current?.condition?.text}
      </Text>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={require('../../assets/icons/wind.png')} style={{ width: 24, height: 24 }} />
        <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{current?.wind_kph}km</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={require('../../assets/images/moderaterain.png')} style={{ width: 24, height: 24 }} />
        <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{current?.humidity}%</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={require('../../assets/images/line.png')} style={{ width: 24, height: 24 }} />
        <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{current?.pressure_mb}mb</Text>
      </View>
    </View>
  </View>
  </View>


             {/* forecast for next days */}
<View style={{ marginBottom: 2, marginTop: 3 }}>
  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5, marginRight: 5, marginBottom: 3 }}>
    <CalendarDaysIcon size={22} color="white" />
    <Text style={{ color: 'white', fontSize: 16 }}>Daily forecast</Text>
  </View>
  <ScrollView
    horizontal
    contentContainerStyle={{ paddingHorizontal: 15 }}
    showsHorizontalScrollIndicator={false}
  >
    {weather?.forecast?.forecastday?.map((item, index) => {
      const date = new Date(item.date);
      const options = { weekday: 'long' };
      let dayName = date.toLocaleDateString('en-US', options);
      dayName = dayName.split(',')[0];

      return (
        <View
          key={index}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            width: 100,
            borderRadius: 10,
            paddingVertical: 10,
            marginRight: 4,
            backgroundColor: theme.bgWhite(0.15),
          }}
        >
          <Image
            // source={{uri: 'https:'+item?.day?.condition?.icon}}
            source={weatherImages[item?.day?.condition?.text || 'other']}
            style={{ width: 44, height: 44 }}
          />
          <Text style={{ color: 'white' }}>{dayName}</Text>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{item?.day?.avgtemp_c}&#176;</Text>
        </View>
                      )
                    })
                  }
                  
                </ScrollView>
              </View>
              
            
            </SafeAreaView>
          )
        }
      
    </View>
  )
}