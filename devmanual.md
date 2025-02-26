## Workflow Guide

#### 1. Open your branch (when using GitHub Desktop) or type:
```sh
git checkout your-branch
```

#### 2. Update with the last changes in main
```sh
git pull origin main
```

#### 3. Commit and push your changes:
```sh
git add .
git commit -m "Your commit message"
git push
```

##### 4. Check for changes in main and update it (if there are no updates you can move forward to step 5)
```sh
git fetch origin
git rebase origin/main
```

#### 5. Switch to main
```sh
git checkout main
```

#### 6. Merge your branch with main
```sh
git merge your-branch
```

#### 7. Push to main
```sh
git push origin main
```