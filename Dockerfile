# Step 1: Use official Node.js image as the base
FROM node:18

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the remaining application files
COPY . .

# Step 6: Compile the TypeScript code (adjust based on your build process)
RUN npm run build

# Step 7: Set the command to run your application (replace `dev` if needed)
CMD ["npm", "run", "dev"]
