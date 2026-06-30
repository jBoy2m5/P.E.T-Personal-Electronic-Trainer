import axiosClient from './axiosClient';

export const getAllExercises = () => axiosClient.get('/exercises');
export const getMuscleGroupById = (id) => axiosClient.get(`/muscle-groups/${id}`);
