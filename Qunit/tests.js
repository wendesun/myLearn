QUnit.test( "isLeapYear4", function( assert ) {
    assert.ok( treevc.isLeapYear(4), "is a leap year!" );
});
QUnit.test( "isLeapYear5", function( assert ) {
    assert.ok( treevc.isLeapYear(5), "is not a leap year!" );
});
QUnit.test( "isLeapYear100", function( assert ) {
    assert.ok( treevc.isLeapYear(100), "is not a leap year!" );
});
QUnit.test( "isLeapYear400", function( assert ) {
    assert.ok( treevc.isLeapYear(400), "is a leap year!" );
});
QUnit.test( "isLeapYear1696", function( assert ) {
    assert.ok( treevc.isLeapYear(1696), "is a leap year!" );
});


QUnit.test( "fizzBuzz test", function( assert ) {
    assert.ok( treevc.fizzBuzz(1) == "1", "1" );
    assert.ok( treevc.fizzBuzz(3) == "fizz", "fizz" );
    assert.ok( treevc.fizzBuzz(5) == "Buzz", "Buzz" );
    assert.ok( treevc.fizzBuzz(7) == "7", "7" );
    assert.ok( treevc.fizzBuzz(15) == "fizzBuzz", "fizzBuzz" );
});
