function App() {
    return (
        <>
            <h1>3D Print Dungon</h1>
            <p>A place for 3d printable models</p>
            <p>this is a new paragraph just to check if it works</p>
            <p>last test</p>
            <p>feature-1</p>
            <p>
                1.create branch -go to main: git checkout main -create branch:
                git branch feature-1 -list all branches: git branch -a -go to
                the new branch: git checkout feature-1 or simply create a branch
                and open it at once: -git checkout -b [branch_name] 2.stage and
                commit changes on branch -from the branch do the following
                -stage changes: git add . -commit changes: git commit -am "added
                feature-1" 3.merge branches with main -git checkout main -git
                merge feature-1 4.delete branch -go to main: git checkout main
                -git branch -d feature-1 (if branch is merged) -git branch -D
                feature-1 (if branch is not merged)
            </p>
        </>
    );
}

export default App;
