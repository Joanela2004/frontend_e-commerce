import api from "./api";

const ARTICLE_URL = "/articles";

const getConfig = (isFormData = false) => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Utilisateur non authentifié");

  const headers = { Authorization: `Bearer ${token}` };
  if (isFormData) headers["Content-Type"] = "multipart/form-data";

  return { headers, withCredentials: true };
};

export const fetchArticles = async () => {
  const res = await api.get(ARTICLE_URL);
  return res.data;
};


export const createArticle = async (formData) => {
  const res = await api.post(ARTICLE_URL, formData, getConfig(true));
  return res.data;
};

export const fetchArticleById = async (id) => {
  const response = await api.get(`${ARTICLE_URL}/${id}`);
  return response.data;
};

export const updateArticle = async (id, formData) => {
  const res = await api.post(`${ARTICLE_URL}/${id}?_method=PUT`, formData, getConfig(true));
  return res.data;
};


export const deleteArticle = async (id) => {
  const res = await api.delete(`${ARTICLE_URL}/${id}`, getConfig());
  return res.data;
};
