import {View, Text, StyleSheet, SafeAreaView, ScrollView} from "react-native";
import React from "react";

const Template = () => {
    return(
        <SafeAreaView>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{marginTop: 50}}>
                    <Text>NewPost</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Template;

const styles = StyleSheet.create({

    }
);