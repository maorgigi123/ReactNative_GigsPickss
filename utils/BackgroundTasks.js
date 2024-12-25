import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

// Define the task name
const BACKGROUND_FETCH_TASK = 'background-fetch-task';

// Define the background fetch task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // Perform your background fetch operations here
    console.log('Background fetch task is running');
    // Example: Fetch data from an API
    // const response = await fetch('https://example.com/api/data');
    // const data = await response.json();
    // console.log(data);
  } catch (error) {
    console.error('Error in background fetch task:', error);
  }
});

// Register the background fetch task
export const registerBackgroundFetch = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background fetch task registered');
  } catch (error) {
    console.error('Error registering background fetch task:', error);
  }
};
