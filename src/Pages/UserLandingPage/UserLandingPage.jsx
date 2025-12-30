import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../supabaseClient";
import "./UserLandingPage.css";

const monthBackgrounds = {
  0: "bg-jan.jpg",
  1: "bg-feb.jpg",
  2: "bg-mar.jpg",
  3: "bg-apr.jpg",
  4: "bg-may-2.jpg",
  5: "bg-jun.jpg",
  6: "bg-jul.jpg",
  7: "bg-aug.jpg",
  8: "bg-sep.jpg",
  9: "bg-oct.jpg",
  10: "bg-nov-2.jpg",
  11: "bg-dec-cal.jpg",
};

const UserLandingPage = ({ username = "user" }) => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [manualGroceryList, setManualGroceryList] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [session, setSession] = useState(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initPage = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession?.user?.id) {
        // Fetch Favorites
        const { data: favs } = await supabase
          .from("recipes")
          .select("*")
          .eq("user_id", currentSession.user.id)
          .eq("is_favorite", true);
        setFavoriteRecipes(favs || []);

        // Fetch Meal Plans
        const { data: mealsData } = await supabase
          .from("meal_plans")
          .select("id, planned_date, recipe_id, recipes(title)")
          .eq("user_id", currentSession.user.id);

        const mealMap = {};
        mealsData?.forEach((m) => {
          if (!mealMap[m.planned_date]) mealMap[m.planned_date] = [];
          mealMap[m.planned_date].push({
            planId: m.id,
            recipeId: m.recipe_id,
            title: m.recipes?.title,
          });
        });
        setCalendarData(mealMap);

        // Fetch Grocery Overrides/Manual Items
        const { data: groceryRecords } = await supabase
          .from("grocery_lists")
          .select("items")
          .eq("user_id", currentSession.user.id)
          .maybeSingle();
        if (groceryRecords) setManualGroceryList(groceryRecords.items || []);
      }
    };
    initPage();
  }, []);

  // --- PERSISTENCE ---
  const saveGroceryToDb = async (list) => {
    if (!session?.user?.id) return;
    const { error } = await supabase
      .from("grocery_lists")
      .upsert(
        { user_id: session.user.id, items: list },
        { onConflict: "user_id" }
      );
    if (error) console.error("DB Save Error:", error.message);
  };

  // --- GROCERY AGGREGATION & LOGIC ---
  const fullGroceryList = useMemo(() => {
    const totals = {};

    // Helper to turn strings like "1 1/2" into 1.5
    const parseQty = (qtyStr) => {
      if (!qtyStr || typeof qtyStr !== "string") return parseFloat(qtyStr) || 0;
      try {
        if (qtyStr.includes("/")) {
          const parts = qtyStr.split(" ");
          if (parts.length > 1) {
            const [n, d] = parts[1].split("/").map(Number);
            return parseFloat(parts[0]) + n / d;
          }
          const [n, d] = qtyStr.split("/").map(Number);
          return n / d;
        }
        return parseFloat(qtyStr) || 0;
      } catch {
        return 0;
      }
    };

    // 1. Process all ingredients from the calendar
    Object.values(calendarData)
      .flat()
      .forEach((meal) => {
        const recipe = favoriteRecipes.find((r) => r.id === meal.recipeId);
        recipe?.ingredients?.forEach((ing) => {
          const numMatch = ing.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(\.\d+)?)/);
          const rawQty = numMatch ? numMatch[0] : "1";
          const remaining = ing.replace(rawQty, "").trim();
          const parts = remaining.split(" ");
          const unit = parts[0]?.length < 10 ? parts[0] : "";
          const name = unit ? parts.slice(1).join(" ") : remaining;

          const key = `recipe-${name
            .toLowerCase()
            .replace(/\s+/g, "-")}-${unit.toLowerCase()}`;

          if (totals[key]) {
            const currentVal = parseQty(totals[key].qty.toString());
            const addedVal = parseQty(rawQty);
            totals[key].qty = (currentVal + addedVal).toString();
          } else {
            totals[key] = { id: key, name, qty: rawQty, unit, isManual: false };
          }
        });
      });

    // 2. Apply Manual Overrides & Add Manual Items
    // We convert manualGroceryList to a map for quick lookup
    const finalItemsMap = { ...totals };
    manualGroceryList.forEach((mItem) => {
      finalItemsMap[mItem.id] = mItem;
    });

    return Object.values(finalItemsMap);
  }, [calendarData, favoriteRecipes, manualGroceryList]);

  const updateGroceryItem = async (id, changes) => {
    let newList;
    const existingIndex = manualGroceryList.findIndex((item) => item.id === id);

    if (existingIndex > -1) {
      newList = manualGroceryList.map((item) =>
        item.id === id ? { ...item, ...changes } : item
      );
    } else {
      // Find the aggregated item to create the initial override entry
      const itemToOverride = fullGroceryList.find((item) => item.id === id);
      newList = [...manualGroceryList, { ...itemToOverride, ...changes }];
    }

    setManualGroceryList(newList);
    await saveGroceryToDb(newList);
  };

  const addItemToGrocery = async (name) => {
    if (!name.trim()) return;
    const newItemObj = {
      id: `manual-${Date.now()}`,
      name,
      qty: "1",
      unit: "",
      isManual: true,
    };
    const newList = [...manualGroceryList, newItemObj];
    setManualGroceryList(newList);
    setNewItem("");
    await saveGroceryToDb(newList);
  };

  const deleteGroceryItem = async (id) => {
    const newList = manualGroceryList.filter((item) => item.id !== id);
    setManualGroceryList(newList);
    await saveGroceryToDb(newList);
  };

  // --- CALENDAR LOGIC ---
  const addMealToCalendar = async (dateStr, recipe) => {
    const { data, error } = await supabase
      .from("meal_plans")
      .insert([
        {
          user_id: session.user.id,
          planned_date: dateStr,
          recipe_id: recipe.id,
        },
      ])
      .select();

    if (!error) {
      setCalendarData((prev) => ({
        ...prev,
        [dateStr]: [
          ...(prev[dateStr] || []),
          { planId: data[0].id, recipeId: recipe.id, title: recipe.title },
        ],
      }));
    }
  };

  const removeMealFromCalendar = async (dateStr, planId) => {
    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("id", planId);
    if (!error) {
      setCalendarData((prev) => ({
        ...prev,
        [dateStr]: prev[dateStr].filter((m) => m.planId !== planId),
      }));
    }
  };

  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = Array(firstDay).fill(null);
    for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++)
      days.push(new Date(year, month, d));
    return days;
  };

  return (
    <div className="user-landing-page">
      <section className="greeting">
        <h1>{username}'s Kitchen</h1>
      </section>

      <section className="favorites">
        <h2>Favorites</h2>
        <div className="recipe-cards">
          {favoriteRecipes.map((r) => (
            <div
              key={r.id}
              className="recipe-card"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("recipeId", r.id)}
            >
              <img src={r.image_url || r.image} alt={r.title} />
              <h3>{r.title}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="meal-calendar">
        <div className="calendar-header">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                  1
                )
              )
            }
          >
            ◀
          </button>
          <h2>
            {currentMonth.toLocaleString("default", { month: "long" })}{" "}
            {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                  1
                )
              )
            }
          >
            ▶
          </button>
        </div>
        <div
          className="calendar-grid-month"
          style={{
            backgroundImage: `url(${
              monthBackgrounds[currentMonth.getMonth()]
            })`,
            backgroundSize: "cover",
          }}
        >
          {getMonthDays().map((day, idx) => {
            if (!day) return <div key={idx} className="empty-day"></div>;
            const ds = `${day.getFullYear()}-${String(
              day.getMonth() + 1
            ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
            return (
              <div
                key={ds}
                className="calendar-day-month"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const rid = e.dataTransfer.getData("recipeId");
                  const recipe = favoriteRecipes.find(
                    (r) => String(r.id) === rid
                  );
                  if (recipe) addMealToCalendar(ds, recipe);
                }}
              >
                <span className="day-number">{day.getDate()}</span>
                <div className="meal-slots">
                  {(calendarData[ds] || []).map((m) => (
                    <div key={m.planId} className="meal-tag">
                      <span>{m.title}</span>
                      <button
                        onClick={() => removeMealFromCalendar(ds, m.planId)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="bottom-panel">
        <section className="grocery-list">
          <h2>Grocery List</h2>
          <div className="grocery-headers">
            <span>Name</span>
            <span>Qty</span>
            <span>Unit</span>
            <span></span>
          </div>
          <ul>
            {fullGroceryList.map((item) => (
              <li key={item.id} className="grocery-item">
                <span className="grocery-name">{item.name}</span>
                <input
                  type="text"
                  value={item.qty || ""}
                  onChange={(e) =>
                    updateGroceryItem(item.id, { qty: e.target.value })
                  }
                  className="grocery-qty-input"
                />
                <select
                  value={item.unit || ""}
                  onChange={(e) =>
                    updateGroceryItem(item.id, { unit: e.target.value })
                  }
                  className="grocery-unit-select"
                >
                  <option value="">—</option>
                  <option value="cup">cup</option>
                  <option value="oz">oz</option>
                  <option value="lb">lb</option>
                  <option value="tbsp">tbsp</option>
                  <option value="tsp">tsp</option>
                  <option value="g">g</option>
                </select>
                <button
                  className="grocery-item-delete-btn"
                  onClick={() => deleteGroceryItem(item.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="add-item">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItemToGrocery(newItem)}
              placeholder="Add extra item (e.g. Milk)..."
            />
          </div>
        </section>

        <section className="nutrition-info">
          <h2>Nutrition Info</h2>
          <p>Totals based on your calendar.</p>
        </section>
      </div>
    </div>
  );
};

export default UserLandingPage;
