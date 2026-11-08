import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import * as api from "../services/api";
import { categories } from "../data/restaurants";

const DataContext = createContext(null);

const JOBS_KEY = "foodapp_jobs";

// state that is saved to localstorage on every change (jobs only, for now)
function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage can be full or blocked, the app still works without saving
    }
  }, [key, value]);

  return [value, setValue];
}

// emoji and color are not in the database, take them from the category
function look(restaurant) {
  return {
    ...restaurant,
    emoji: categories.find((c) => c.name === restaurant.category)?.emoji || "🍽️",
    color: "#fff0e4",
  };
}

export function DataProvider({ children }) {
  const { user } = useAuth();

  // public restaurants for everyone
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // all restaurants with codes, super admin only
  const [adminRestaurants, setAdminRestaurants] = useState([]);

  // the restaurant of the logged in restaurant admin
  const [myRestaurant, setMyRestaurant] = useState(null);

  // still local until the backend has endpoints for jobs
  const [jobs, setJobs] = useStored(JOBS_KEY, []);

  // load everything the current user can see
  const reload = useCallback(async () => {
    try {
      const list = await api.fetchRestaurants();
      setRestaurants(list.map(look));
      setError("");
    } catch {
      setError("Az éttermeket nem sikerült betölteni.");
    } finally {
      setLoading(false);
    }

    if (user?.role === "SUPER_ADMIN") {
      try {
        const all = await api.fetchAdminRestaurants();
        setAdminRestaurants(all.map(look));
      } catch {
        setAdminRestaurants([]);
      }
    } else {
      setAdminRestaurants([]);
    }

    if (user?.role === "RESTAURANT_ADMIN") {
      try {
        const mine = await api.fetchMine();
        setMyRestaurant(mine ? look(mine) : null);
      } catch {
        setMyRestaurant(null);
      }
    } else {
      setMyRestaurant(null);
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  // ---------- restaurants (super admin) ----------

  async function addRestaurant(values) {
    const created = await api.createRestaurant(values);
    await reload();
    return created;
  }

  async function removeRestaurant(id) {
    try {
      await api.deleteRestaurant(id);
      await reload();
    } catch (err) {
      alert(err.message);
    }
  }

  // show or hide a restaurant for customers
  async function toggleActive(id) {
    await api.toggleRestaurant(id);
    await reload();
  }

  // ---------- menu (restaurant admin) ----------

  async function addMenuItem(item) {
    try {
      await api.addMenuItem(item);
      await reload();
    } catch (err) {
      alert(err.message);
    }
  }

  async function removeMenuItem(itemId) {
    await api.deleteMenuItem(itemId);
    await reload();
  }

  // ---------- jobs (local for now) ----------

  function addJob(restaurantId, { title, type, description }) {
    const job = {
      id: `j-${Date.now()}`,
      restaurantId,
      title,
      type,
      description,
      createdAt: new Date().toISOString(),
      applications: [],
    };

    setJobs((current) => [job, ...current]);
  }

  function removeJob(jobId) {
    setJobs((current) => current.filter((job) => job.id !== jobId));
  }

  function applyToJob(jobId, { userId, name, message, cvUrl }) {
    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              applications: [
                ...job.applications,
                {
                  id: `a-${Date.now()}`,
                  userId,
                  name,
                  message,
                  cvUrl,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : job
      )
    );
  }

  return (
    <DataContext.Provider
      value={{
        restaurants,
        publicRestaurants: restaurants,
        adminRestaurants,
        myRestaurant,
        loading,
        error,
        reload,
        addRestaurant,
        removeRestaurant,
        toggleActive,
        addMenuItem,
        removeMenuItem,
        jobs,
        addJob,
        removeJob,
        applyToJob,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// hook so any component can read and change the shared data
// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  return useContext(DataContext);
}