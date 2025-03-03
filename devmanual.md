## Workflow Guide

#### 1.Open the project and sync your local repo
```sh
main: git pull origin main 
```

#### 2.Create new branch
```sh
main: git checkout -b [branch-name]
```

#### 3.When job is done.. add, commit, push
```sh
branch: git add .
branch: git commit -am "message"
branch: git push origin [branch-name]

NOTE!
#push the branch to remote repo, so others can see it
#do not merge with main yet!
```







OLD DATED INFO xD

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
