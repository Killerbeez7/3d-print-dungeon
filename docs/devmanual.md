## Workflow Guide

#### 1.Open the project and sync your local repo
```sh
main: git pull origin main 
```

#### 2.Create new branch
```sh
main: git checkout -b [branch-name]
branch-name: git add .
branch-name: git commit -am "new branch"
branch-name: git push --set-upstream origin [branch-name]
```

#### 3.When job is done.. add, commit, push
```sh
branch: git add .
branch: git commit -am "message"
branch: git push

NOTE!
#push the branch to remote repo, so others can see it
#do not merge with main yet!
```



#### 4. Test Locally (Optional)
Before deploying, run the app locally to make sure everything works as expected:
```sh
npm run dev
```

#### 5. Deploy to Firebase
Once you're confident everything is working, deploy the latest changes to Firebase:
```sh
npm build
firebase deploy
```

#### 6. Sync Local branches with remote ones
After adding or deleting a branch in git run this command to sync you local repo
```sh
git fetch --prune
```