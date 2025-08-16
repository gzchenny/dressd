import { ENV } from '@/constants/Environment';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';


const ImageRecognition = () => {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [labels, setLabels] = useState<any[]>([]);

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
            }
            console.log(result);

        } catch (error) {
            console.error('Error picking Image: ', error);
        }
    };

    const analyseImage = async () => {
        // Get API key from environment
        const apiKey = ENV.GOOGLE_CLOUD_API_KEY;
        const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

        try {
            if (!imageUri) {
                alert('Please select an image first.');
                return;
            }

            if (!apiKey) {
                alert('Google Cloud API key is not configured.');
                return;
            }

            // TODO: Implement Google Cloud Vision API call
            console.log('API Key loaded:', apiKey ? 'Yes' : 'No');

            const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const requestData = {
                requests: [
                    {
                        image: {
                            content: base64ImageData,
                        },
                        features: [{ type: 'LABEL_DETECTION', maxResults: 10 }],
                    },
                ],
            };

            const apiResponse = await axios.post(apiURL, requestData);
            console.log('API Response:', apiResponse.data);
            setLabels(apiResponse.data.responses[0].labelAnnotations);

        } catch (error: any) {
            console.error('Error analyzing image:', error);
            console.error('Error details:', error.response?.data);
            console.error('Status code:', error.response?.status);
            console.error('API URL used:', apiURL);
            alert(`Error analyzing image: ${error.response?.status || 'Unknown error'}`);
        }
    }

    return (
        <View>
            <Text>Image Recognition</Text>
            {imageUri && (
                <Image
                    source={{ uri: imageUri }}
                    style={{ width: 300, height: 300 }}
                />
            )}

            <TouchableOpacity onPress={pickImage}>
                <Text>Choose an image</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={analyseImage}>
                <Text>Analyze Image</Text>
            </TouchableOpacity>

            {labels.length > 0 && (
                <View>
                    <Text>Labels:</Text>
                    {labels.map((label, index) => (
                        <Text key={index}>
                            {label.description} ({Math.round(label.score * 100)}%)
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
}

export default ImageRecognition