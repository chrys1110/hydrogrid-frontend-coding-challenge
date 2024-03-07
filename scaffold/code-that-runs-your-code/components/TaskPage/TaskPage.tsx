import { Children as ReactChildrenUtils, Fragment, ReactElement, ReactNode, useMemo } from 'react';
import { formatError, formatValue, formatWithColor } from '../../shared/formatOutput';
import { isFunctionImplemented } from '../../shared/isFunctionImplemented';
import { isJSX } from '../../shared/valueTypes';
import { useLocation } from '../MiniRouter';
import { MakeChartInteractive } from '../TopologyGraph/InteractiveContext';
import styles from './TaskPage.module.css';

interface TaskPageProps {
  description: string;
  systemUnderTest: (input: any) => any;
  placeholderCode?: string | RegExp;
  children: ReactNode;
}

interface TestResult {
  output: unknown;
  exception?: unknown;
  validationErrors?: string;
  outcome: 'success' | 'wrong-output' | 'invalid-output' | 'exception';
}

export function TaskPage({ description, children, systemUnderTest, placeholderCode }: TaskPageProps) {
  const route = useLocation();

  const tab: 'description' | number = useMemo(() => {
    const tabNumber = Number.parseInt(route.hash.replace(/^#test-case-/, ''), 10) - 1;
    return Number.isNaN(tabNumber) ? 'description' : tabNumber;
  }, [route]);

  const testCases = ReactChildrenUtils.toArray(children)
    .filter(isTestCase)
    .map(child => child.props);

  const notYetImplemented = useMemo(() => {
    if (!placeholderCode) return false;
    const notYetImplemented = !isFunctionImplemented(systemUnderTest, placeholderCode);
    return notYetImplemented;
  }, [systemUnderTest, placeholderCode]);

  const testResults = useMemo(() => {
    if (notYetImplemented) return [];

    const sessionStorageKey = 'HydrogridCodingChallenge:clearConsoleBeforeRunningTests';

    if (sessionStorage.getItem(sessionStorageKey) === 'true') {
      console.clear();
    }
    console.info(`%cRunning ${testCases.length} test cases`, 'font-size:1.5em; margin:initial 0.5em');
    console.info('%c🛈 The selected test case is executed first, so you can use debugger breakpoints', 'color:lightblue');
    console.info(
      'Clear console before every test run? ',
      {
        get yes() {
          sessionStorage.setItem(sessionStorageKey, 'true');
          return "Okay! You have to disable 'Preserve log' in the devtools for this to take effect.";
        },
        get no() {
          sessionStorage.removeItem(sessionStorageKey);
          return 'Okay! No longer clearing your console.';
        }
      },
      ' (click on ► to toggle)'
    );

    // Run the current focused tab first, to simplify debugging
    const tabIndices = testCases.map((_, index) => index);
    const runOrder = tab === 'description' || !testCases[tab] ? tabIndices : [tab, ...tabIndices.filter(n => n !== tab)];

    const results = new Map<number, TestResult>();

    for (const testIndex of runOrder) {
      if (testIndex === runOrder[1] && typeof tab === 'number') {
        console.groupCollapsed('%cOther test cases (click ► to expand)', 'font-weight:normal');
      }

      const test = testCases[testIndex];
      const result = runTestCase(systemUnderTest, test, testIndex + 1, testIndex === tab);
      results.set(testIndex, result);
    }

    if (testCases.length > 1 && typeof tab === 'number') {
      console.groupEnd();
    }

    const resultsInTabOrder = tabIndices.map(index => results.get(index)!);
    return resultsInTabOrder;
  }, [notYetImplemented, testCases, tab, systemUnderTest]);

  const tabs = useMemo(
    () => (
      <div className={styles.tabs}>
        <a href={route.pathname} className={tab === 'description' ? styles.activeTab : styles.tab}>
          Description
        </a>
        {testCases.length > 0 && (
          <div className={styles.testCases}>
            <div className={styles.testCasesText}>Test Cases:</div>
            {testCases.map((_testCase, index) => (
              <a key={index} href={`#test-case-${index + 1}`} className={tab === index ? styles.activeTab : styles.tab}>
                <span className={classNameForStatus(testResults[index])}>{index + 1}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    ),
    [tab, route, testCases, testResults]
  );

  const testCase = testCases[Number(tab)] as TestCaseProps | undefined;
  const result = testResults[Number(tab)] as TestResult | undefined;

  if (tab === 'description' || tab >= testCases.length || !testCase) {
    const nonTestCaseChildren = ReactChildrenUtils.toArray(children).filter(child => !isTestCase(child));

    return (
      <div className={styles.taskPage}>
        {tabs}
        <div className={styles.tabPanel}>
          {nonTestCaseChildren}
          <div className={styles.description}>
            {description
              .replace(/\n {2}/g, '\n')
              .replace(/\n\n+/g, '\n\n')
              .replace(/^\s*Task \d:\n+/, '')}
          </div>
          {notYetImplemented && (
            <strong className={styles.notYetImplementedInfo}>
              Click the test cases and start implementing the function to see the results!
            </strong>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.taskPage} key={tab}>
      {tabs}
      <div className={`${styles.tabPanel} ${styles.testCaseDescription}`}>
        <h2>
          Test Case {tab + 1}: <span className={styles.testCaseName}>{testCase.description}</span>
        </h2>
        <div className={styles.codeAndExplanation}>
          <pre>
            <code>
              {`const output = yourFunction(input);\n`}
              {!result && notYetImplemented && `// ... start implementing the function to see the results here ...\n`}
              {result?.outcome === 'exception' &&
                `Your function threw an exception!\n${formatError(result.exception)}`.split('\n').map((line, index) => (
                  <Fragment key={index}>
                    {`// `}
                    <span className={styles.threwException}>{line}</span>
                    {`\n`}
                  </Fragment>
                ))}
              {result?.outcome === 'success' && !result?.validationErrors && (
                <>
                  {'// output = '}
                  {formatWithColor(formatValue(result?.output), styles.rightOutput)}
                  {'\n'}
                </>
              )}
              {(result?.outcome === 'wrong-output' || result?.outcome === 'invalid-output') && (
                <>
                  {'// output = '}
                  {formatWithColor(formatValue(result?.output), styles.wrongOutput)}
                  {'\n'}
                </>
              )}
              {isJSX(result?.output) && (
                <>
                  <div className={styles.reactOutput + (result?.outcome === 'success' ? '' : ` ${styles.reactOutputWithErrors}`)}>
                    <figure>
                      <MakeChartInteractive>{result?.output}</MakeChartInteractive>
                      <figcaption>Your output</figcaption>
                    </figure>
                    {isJSX(testCase.expectedOutput) ? (
                      <figure>
                        {testCase.expectedOutput}
                        <figcaption>Expected output</figcaption>
                      </figure>
                    ) : isJSX(testCase.exampleOutput) ? (
                      <figure>
                        {testCase.exampleOutput}
                        <figcaption>Example output</figcaption>
                      </figure>
                    ) : null}
                  </div>
                  {`\n`}
                </>
              )}
              {result?.validationErrors && (
                <>
                  {`// output is invalid:\n// `}
                  {formatWithColor(
                    result.validationErrors
                      .split('\n')
                      .map(l => `  ${l}`)
                      .join('\n'),
                    styles.validationErrors
                  )}
                  {'\n'}
                </>
              )}
              {testCase != null && 'expectedOutput' in testCase && (
                <>
                  {`// expectedOutput = `}
                  {formatWithColor(formatValue(testCase?.expectedOutput), result?.outcome === 'wrong-output' ? styles.wrongOutput : '')}
                  {`\n`}
                </>
              )}
              {`\nconst input = ${JSON.stringify(testCase.input, null, 2)};`}
            </code>
          </pre>
          {testCase.children && (!result?.output || !isJSX(testCase.expectedOutput)) && (
            <div className={styles.explanation}>{testCase.children}</div>
          )}
          {!testCase.children && !result?.output && isJSX(testCase.expectedOutput) && (
            <div className={styles.explanation}>
              <figure>
                {testCase.expectedOutput}
                <figcaption>Expected output</figcaption>
              </figure>
            </div>
          )}
          {!testCase.children && !result?.output && isJSX(testCase.exampleOutput) && (
            <div className={styles.explanation}>
              <figure>
                {testCase.exampleOutput}
                <figcaption>Example output</figcaption>
              </figure>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function runTestCase(
  systemUnderTest: (input: any) => any,
  test: TestCaseProps,
  testCaseNumber: number,
  isCurrentTestCase: boolean
): TestResult {
  try {
    if (isCurrentTestCase) {
      console.group(`%cTest case ${testCaseNumber}: ${test.description}`, 'font-weight:bold');
    } else {
      console.groupCollapsed(`%cTest case ${testCaseNumber}: ${test.description}`, 'font-weight:normal');
    }

    console.info('input = ', test.input);

    Object.defineProperty(test.input, 'testcase', {
      configurable: true,
      writable: true,
      value: testCaseNumber
    });

    const output = systemUnderTest(test.input);
    console.info('output = ', output);

    if ('expectedOutput' in test) {
      console.info('expected output = ', test.expectedOutput);
    }

    const result: TestResult = { outcome: 'success', output };

    if (test.validate) {
      const validationResult = test.validate(test.input, output);
      if (validationResult !== true) {
        console.info('invalid output: ', validationResult);
        return { outcome: 'invalid-output', validationErrors: validationResult, output };
      }
    }

    if ('expectedOutput' in test) {
      const isExpected = Object.is(output, test.expectedOutput) || formatValue(output) === formatValue(test.expectedOutput);
      result.outcome = isExpected ? 'success' : 'wrong-output';
    }

    return result;
  } catch (exception) {
    // Log to the console so the browser resolves sourcemaps and shows the correct line/column of the .tsx
    console.error(exception);
    return { outcome: 'exception', output: null, exception };
  } finally {
    console.groupEnd();
  }
}

interface TestCaseProps<T extends unknown = unknown, O extends unknown = unknown> {
  description: string;
  input: T;
  exampleOutput?: O;
  expectedOutput?: O;
  validate?: (input: T, output: O) => string | true;
  children?: ReactNode;
}

export function TestCase<T>(_props: TestCaseProps<T>) {
  return null;
}
TestCase.kind = 'TestCase';

function isTestCase(child: any): child is ReactElement<TestCaseProps, typeof TestCase> {
  return typeof child === 'object' && child && 'type' in child && child.type?.kind === 'TestCase';
}

function classNameForStatus(result: TestResult) {
  switch (result?.outcome) {
    case 'success':
      return styles.success;

    case 'exception':
    case 'wrong-output':
    case 'invalid-output':
      return styles.failure;

    case undefined:
    default:
      const typecheck: never = result?.outcome;
      void typecheck;
      return undefined;
  }
}
