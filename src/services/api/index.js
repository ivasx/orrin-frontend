import * as realApi from './api.real.js';
import * as mockApi  from './api.mock.js';
import { logger } from '../../utils/logger.js';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

if (useMock) {
    logger.warn('API SERVICE: Running in MOCK mode using local mockData.js');
}

const api = useMock ? mockApi : realApi;

export const ApiError                  = realApi.ApiError;
export const setAccessToken            = realApi.setAccessToken;
export const setSessionExpiredCallback = realApi.setSessionExpiredCallback;
export const fetchJson                 = realApi.fetchJson;

export const loginUser            = api.loginUser            || realApi.loginUser;
export const registerUser         = api.registerUser         || realApi.registerUser;
export const requestPasswordReset = api.requestPasswordReset || realApi.requestPasswordReset;
export const confirmPasswordReset = api.confirmPasswordReset || realApi.confirmPasswordReset;
export const getSocialLoginUrl    = api.getSocialLoginUrl    || realApi.getSocialLoginUrl;

export const getTracks      = api.getTracks      || realApi.getTracks;
export const getTracksByIds = api.getTracksByIds || realApi.getTracksByIds;
export const getTrackBySlug = api.getTrackBySlug || realApi.getTrackBySlug;

export const getUserLibrary   = api.getUserLibrary   || realApi.getUserLibrary;
export const getUserFavorites = api.getUserFavorites || realApi.getUserFavorites;
export const getUserHistory   = api.getUserHistory   || realApi.getUserHistory;

export const getListeningHistory    = api.getListeningHistory    || realApi.getListeningHistory;
export const clearListeningHistory  = api.clearListeningHistory  || realApi.clearListeningHistory;
export const removeTrackFromHistory = api.removeTrackFromHistory || realApi.removeTrackFromHistory;

export const getLikedSongs       = api.getLikedSongs       || realApi.getLikedSongs;
export const getUserPlaylists    = api.getUserPlaylists    || realApi.getUserPlaylists;
export const getPlaylistById     = api.getPlaylistById     || realApi.getPlaylistById;
export const deletePlaylist      = api.deletePlaylist      || realApi.deletePlaylist;
export const getSavedAlbums      = api.getSavedAlbums      || realApi.getSavedAlbums;
export const getFollowingArtists = api.getFollowingArtists || realApi.getFollowingArtists;
export const createPlaylist      = api.createPlaylist      || realApi.createPlaylist;

export const getArtists           = api.getArtists           || realApi.getArtists;
export const getArtistById        = api.getArtistById        || realApi.getArtistById;
export const updateArtistProfile  = api.updateArtistProfile  || realApi.updateArtistProfile;
export const getArtistPosts       = api.getArtistPosts       || realApi.getArtistPosts;

export const getFeedPosts    = api.getFeedPosts    || realApi.getFeedPosts;
export const createPost      = api.createPost      || realApi.createPost;
export const toggleLikePost  = api.toggleLikePost  || realApi.toggleLikePost;
export const repostPost      = api.repostPost      || realApi.repostPost;
export const addComment      = api.addComment      || realApi.addComment;
export const toggleSavePost  = api.toggleSavePost  || realApi.toggleSavePost;
export const reportPost      = api.reportPost      || realApi.reportPost;

export const getFriendsActivity = api.getFriendsActivity || realApi.getFriendsActivity;
export const searchGlobal       = api.searchGlobal       || realApi.searchGlobal;

export const getCurrentUser      = api.getCurrentUser      || realApi.getCurrentUser;
export const getUserProfile      = api.getUserProfile      || realApi.getUserProfile;
export const updateUserProfile   = api.updateUserProfile   || realApi.updateUserProfile;
export const toggleFollowUser    = api.toggleFollowUser    || realApi.toggleFollowUser;
export const getUserPosts        = api.getUserPosts        || realApi.getUserPosts;
export const getUserFollowers    = api.getUserFollowers    || realApi.getUserFollowers;

export const getNotifications           = api.getNotifications           || realApi.getNotifications;
export const markNotificationAsRead     = api.markNotificationAsRead     || realApi.markNotificationAsRead;
export const markAllNotificationsAsRead = api.markAllNotificationsAsRead || realApi.markAllNotificationsAsRead;

export const getTopTracks  = api.getTopTracks  || realApi.getTopTracks;
export const getTopAlbums  = api.getTopAlbums  || realApi.getTopAlbums;
export const getTopArtists = api.getTopArtists || realApi.getTopArtists;

export const getUserChats    = api.getUserChats    || realApi.getUserChats;
export const getChatMessages = api.getChatMessages || realApi.getChatMessages;
export const sendMessage     = api.sendMessage     || realApi.sendMessage;

export const getTerms         = api.getTerms         || realApi.getTerms;
export const getPrivacyPolicy = api.getPrivacyPolicy || realApi.getPrivacyPolicy;