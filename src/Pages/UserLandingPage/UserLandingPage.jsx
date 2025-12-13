import React, { useState } from "react";
import "./UserLandingPage.css";

//Dummy Data until API

const favoriteRecipes = [
  {
    id: 1,
    title: "Spaghetti Bolognese",
    image: "Pasta-Bolognese-TIMG.jpg",
    ingredients: [
      { name: "Ground Beef", quantity: "1 lb" },
      { name: "Tomato Sauce", quantity: "1 jar" },
      { name: "Spaghetti", quantity: "1 box" },
    ],
  },
  {
    id: 2,
    title: "Chicken Stir Fry",
    image: "csf.jpeg",
    ingredients: [
      { name: "Chicken Breast", quantity: "1 lb" },
      { name: "Broccoli", quantity: "1 head" },
      { name: "Soy Sauce", quantity: "2 tbsp" },
    ],
  },
  {
    id: 3,
    title: "Avocado Toast",
    image: "at.jpeg",
    ingredients: [
      { name: "Avocado", quantity: "1" },
      { name: "Bread", quantity: "2 slices" },
      { name: "Salt", quantity: "1 pinch" },
    ],
  },
];

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
  const [calendarData, setCalendarData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [groceryList, setGroceryList] = useState([]);
  const [newItem, setNewItem] = useState("");

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  };

  const days = getMonthDays();

  const addMealToCalendar = (date, recipe) => {
    const recipeTitle = typeof recipe === "string" ? recipe : recipe.title;

    setCalendarData((prev) => {
      const newCalendar = { ...prev, [date]: recipeTitle };

      const groceryMap = {};
      const recipeCounts = {};

      Object.values(newCalendar).forEach((title) => {
        if (title) recipeCounts[title] = (recipeCounts[title] || 0) + 1;
      });

      favoriteRecipes.forEach((r) => {
        const count = recipeCounts[r.title] || 0;
        if (count > 0 && r.ingredients) {
          r.ingredients.forEach((ing) => {
            const parts = ing.quantity.split(" ");
            const ingAmount = parseFloat(parts[0]) * count;
            const ingUnit = parts[1] || "";

            if (groceryMap[ing.name]) {
              groceryMap[ing.name].amount += ingAmount;
            } else {
              groceryMap[ing.name] = {
                name: ing.name,
                amount: ingAmount,
                unit: ingUnit,
              };
            }
          });
        }
      });
      setGroceryList(
        Object.values(groceryMap).map((item, index) => ({
          ...item,
          id: index + 1,
        }))
      );

      return newCalendar;
    });
  };

  const addItemToGrocery = (itemName) => {
    if (!itemName.trim()) return;

    setGroceryList((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: itemName,
        amount: 1,
        unit: "",
      },
    ]);
    setNewItem("");
  };

  const updateGroceryQuantity = (id, amount) => {
    setGroceryList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, amount: Number(amount) } : item
      )
    );
  };

  return (
    <div className="user-landing-page">
      <section className="greeting">
        <h1>Welcome to {username}'s Kitchen</h1>
        <p>
          Plan your meals, save and share recipes, and organize your grocery
          list!
        </p>
      </section>

      <section className="favorites">
        <h2>Your Favorite Recipes</h2>
        <div className="recipe-cards">
          {favoriteRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="recipe-card"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("recipeId", recipe.id)}
            >
              <img src={recipe.image} alt={recipe.title} />
              <h3>{recipe.title}</h3>
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

        <div className="weekdays">
          {daysOfWeek.map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div
          className="calendar-grid-month"
          style={{
            backgroundImage: `url(${
              monthBackgrounds[currentMonth.getMonth()]
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {days.map((day, index) => {
            if (day === null)
              return <div key={index} className="empty-day"></div>;

            const dateString = day.toISOString().split("T")[0];
            const mealTitle = calendarData[dateString] || "";

            return (
              <div
                key={dateString}
                className="calendar-day-month"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const recipeId = Number(e.dataTransfer.getData("recipeId"));
                  const recipe = favoriteRecipes.find((r) => r.id === recipeId);
                  if (recipe) addMealToCalendar(dateString, recipe);
                }}
              >
                <span className="day-number">{day.getDate()}</span>
                <div className="meal-slot">
                  {mealTitle ? (
                    <strong>{mealTitle}</strong>
                  ) : (
                    <span className="drag-meal-placeholder">
                      Drag Meal Here
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Add Text"
                  value={calendarData[dateString] || ""}
                  onChange={(e) =>
                    addMealToCalendar(dateString, e.target.value)
                  }
                />
              </div>
            );
          })}
        </div>
      </section>

      <div className="bottom-panel">
        <section className="grocery-list">
          <h2>Your Grocery List</h2>
          <div className="grocery-headers">
            <span>Name</span>
            <span>Qty</span>
            <span>Unit</span>
            <span></span>
          </div>
          <ul>
            {groceryList.map((item) => (
              <li key={item.id} className="grocery-item">
                <span>{item.name}</span>
                <input
                  type="number"
                  min="1"
                  value={item.amount}
                  onChange={(e) =>
                    updateGroceryQuantity(item.id, e.target.value)
                  }
                  className="quantity-input"
                />
                <span className="unit">{item.unit}</span>
                <button
                  className="grocery-item-delete-btn"
                  onClick={() =>
                    setGroceryList((prev) =>
                      prev.filter((i) => i.id !== item.id)
                    )
                  }
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="add-item">
            <input
              type="text"
              placeholder="Add item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newItem.trim() !== "") {
                  addItemToGrocery(newItem.trim());
                  setNewItem("");
                }
              }}
            />
          </div>
        </section>

        <section className="nutrition-info">
          <h2>Nutrition Info</h2>
          <p>Select meals to see nutrition per day.</p>
        </section>
      </div>
    </div>
  );
};

export default UserLandingPage;
