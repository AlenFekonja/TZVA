import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 20,
    },
    pinItem: {
      backgroundColor: '#6200ea',
      padding: 15,
      marginVertical: 5,
      borderRadius: 8,
      overflow: 'hidden',
    },
    pinText: {
      color: '#fff',
    },
    detailText: {
      fontSize: 18,
      color: '#333',
      marginVertical: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      marginBottom: 15,
      borderRadius: 8,
    },
    buttonContainer: {
      marginTop: 20, 
      paddingHorizontal: 20,  
  },
  buttonSpacing: {
      marginVertical: 10, 
  },
  rightAction: {
      backgroundColor: 'red',
      padding: 15,
      marginVertical: 5,
      borderRadius: 8,
      width:"100%",
      textAlign: "right",
      flexDirection: 'row',  
      justifyContent: 'flex-end',  
      alignItems: 'center',
  },
  actionText: {
      color: 'white',
      fontWeight: 'bold',
  },
  container2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 20,
    marginBottom: 10,
  },
  });