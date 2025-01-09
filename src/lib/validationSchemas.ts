// Validation schemas for user, task, and task item create and update operations
export const userValidationSchema = {
  email: {
    trim: true,
    isEmail: {
      errorMessage: "Please provide a valid email address.",
    },
    normalizeEmail: true,
  },
  password: {
    trim: true,
    isLength: {
      options: { min: 8 },
      errorMessage: "Password must be at least 8 characters long.",
    },
    matches: {
      options: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#])/,
      errorMessage:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    },
  },
};

export const taskValidationSchema = {
  title: {
    trim: true, // Removes leading and trailing spaces
    notEmpty: {
      errorMessage: "Title cannot be empty.",
    },
    isString: {
      errorMessage: "Title must be a string.",
    },
    isLength: {
      options: { max: 350 },
      errorMessage: "Title cannot exceed 350 characters.",
    },
    escape: true, // Escapes HTML and special characters to prevent XSS
  },
  difficulty: {
    optional: true,
    isInt: {
      options: { min: 1, max: 5 },
      errorMessage: "Difficulty level must be between 1 and 5.",
    },
  },
  importance: {
    optional: true,
    isInt: {
      options: { min: 1, max: 5 },
      errorMessage: "Importance level must be between 1 and 5.",
    },
  },
  dueDate: {
    optional: true,
    isDate: {
      errorMessage: "Due date must be a valid date.",
    },
    custom: {
      options: (value: any) => {
        const today = new Date();
        return (
          new Date(value).setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)
        );
      },
      errorMessage: "Due date must be within today.",
    },
  },
  type: {
    isIn: {
      options: [["GENERAL", "WORK", "PERSONAL", "ERRAND", "SHOPPING", "OTHER"]], // Enum values
      errorMessage:
        "Task type must be one of the following: GENERAL, WORK, PERSONAL, ERRAND, SHOPPING, OTHER",
    },
  },
  completed: {
    optional: true, // Not required during creation; defaults to `false`
    isBoolean: {
      errorMessage: "Completed must be a boolean value (true or false).",
    },
  },
};

export const subTaskValidationSchema = {
  title: {
    trim: true, // Removes leading and trailing spaces
    notEmpty: {
      errorMessage: "Title cannot be empty.",
    },
    isString: {
      errorMessage: "Title must be a string.",
    },
    isLength: {
      options: { max: 350 },
      errorMessage: "Title cannot exceed 350 characters.",
    },
    escape: true, // Escapes HTML and special characters to prevent XSS
  },
  completed: {
    optional: true, // Not required during creation; defaults to `false`
    isBoolean: {
      errorMessage: "Completed must be a boolean value (true or false).",
    },
  },
};

export const taskItemValidationSchema = {
  title: {
    trim: true, // Removes leading and trailing spaces
    notEmpty: {
      errorMessage: "Title cannot be empty.",
    },
    isString: {
      errorMessage: "Title must be a string.",
    },
    isLength: {
      options: { max: 350 },
      errorMessage: "Title cannot exceed 350 characters.",
    },
    escape: true, // Escapes HTML and special characters to prevent XSS
  },
  completed: {
    optional: true, // Not required during creation; defaults to `false`
    isBoolean: {
      errorMessage: "Completed must be a boolean value (true or false).",
    },
  },
  parentType: {
    isIn: {
      options: [["TASK", "SUB_TASK"]], // Enum values
      errorMessage: "Parent task type must be either TASK or SUB_TASK.",
    },
  },
};
