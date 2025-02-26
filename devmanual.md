## Workflow Guide

#### 1. Pull latest changes:
```sh
git checkout main
git pull origin main
```

#### 2. Switch to your feature branch:
```sh
git checkout feature/your-branch
git pull origin main
```

#### 3. Commit your changes:
```sh
git add .
git commit -m "Your commit message"
```

##### 4. Push your feature branch:
```sh
git push origin feature/your-branch
```

#### 5. Rebase and merge (at the end of your work):
```sh
git rebase main | git merge feature/your-branch
git push origin main
```
