function App() {
    return (
        <>
            <h1>3D Print Dungon</h1>
            <p>A place for 3d printable models</p>
            <p>this is a new paragraph just to check if it works</p>
            <p>last test</p>
            <p>feature-1</p>

            <h1>BONUS TIP</h1>
            <p>
                1.create branch <br />
                -go to main: git checkout main <br />
                -create branch: git branch feature-1 <br />
                -list all branches: git branch -a <br />
                -go to the new branch: git checkout feature-1 <br />
                or simply create a branch and open it at once: -git checkout -b
                [branch_name]
            </p>{" "}
            <p>
                2.stage and commit changes on branch <br />
                -from the branch do the following <br />
                -stage changes: git add . <br />
                -commit changes: git commit -am "added feature-1"
            </p>{" "}
            <p>
                3.merge branches with main <br />
                -git checkout main <br />
                -git merge feature-1
            </p>{" "}
            <p>
                4.delete branch <br />
                -go to main: git checkout main <br />
                -git branch -d feature-1 (if branch is merged) <br />
                -git branch -D feature-1 (if branch is not merged)
            </p>
        </>
    );
}

export default App;
