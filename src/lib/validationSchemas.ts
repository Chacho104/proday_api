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
  urgency: {
    isIn: {
      options: [["URGENT", "NOT_URGENT"]], // Enum values
      errorMessage: "Task must be one of the following: URGENT, NOT_URGENT",
    },
  },
  importance: {
    isIn: {
      options: [["IMPORTANT", "NOT_IMPORTANT"]], // Enum values
      errorMessage:
        "Task must be one of the following: IMPORTANT, NOT_IMPORTANT",
    },
  },
  dueDate: {
    optional: true,
    trim: true, // Removes leading and trailing spaces
    notEmpty: {
      errorMessage: "Due date cannot be empty.",
    },
    isString: {
      errorMessage: "Due date must be a string.",
    },
    escape: true, // Escapes HTML and special characters to prevent XSS
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
