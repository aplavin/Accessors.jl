var documenterSearchIndex = {"docs":
[{"location":"examples/custom_macros/","page":"Custom Macros","title":"Custom Macros","text":"EditURL = \"https://github.com/JuliaObjects/Accessors.jl/blob/master/examples/custom_macros.jl\"","category":"page"},{"location":"examples/custom_macros/#Extending-@set-and-@lens","page":"Custom Macros","title":"Extending @set and @lens","text":"","category":"section"},{"location":"examples/custom_macros/","page":"Custom Macros","title":"Custom Macros","text":"This code demonstrates how to extend the @set and @lens mechanism with custom lenses. As a demo, we want to implement @mylens! and @myreset, which work much like @lens and @set, but mutate objects instead of returning modified copies.","category":"page"},{"location":"examples/custom_macros/","page":"Custom Macros","title":"Custom Macros","text":"using Accessors\nusing Accessors: IndexLens, PropertyLens, ComposedLens\n\nstruct Lens!{L}\n    pure::L\nend\n\n(l::Lens!)(o) = l.pure(o)\nfunction Accessors.set(o, l::Lens!{<: ComposedLens}, val)\n    o_inner = Accessors.inner(l.pure)(o)\n    set(o_inner, Lens!(Accessors.outer(l.pure)), val)\nend\nfunction Accessors.set(o, l::Lens!{PropertyLens{prop}}, val) where {prop}\n    setproperty!(o, prop, val)\n    o\nend\nfunction Accessors.set(o, l::Lens!{<:IndexLens}, val) where {prop}\n    o[l.pure.indices...] = val\n    o\nend","category":"page"},{"location":"examples/custom_macros/","page":"Custom Macros","title":"Custom Macros","text":"Now this implements the kind of lens the new macros should use. Of course there are more variants like Lens!(<:DynamicIndexLens), for which we might want to overload set, but lets ignore that. Instead we want to check, that everything works so far:","category":"page"},{"location":"examples/custom_macros/","page":"Custom Macros","title":"Custom Macros","text":"using Test\nmutable struct M\n    a\n    b\nend\n\no = M(1,2)\nl = Lens!(@lens _.b)\nset(o, l, 20)\n@test o.b == 20\n\nl = Lens!(@lens _.foo[1])\no = (foo=[1,2,3], bar=:bar)\nset(o, l, 100)\n@test o == (foo=[100,2,3], bar=:bar)","category":"page"},{"location":"examples/custom_macros/","page":"Custom Macros","title":"Custom Macros","text":"Now we can implement the syntax macros","category":"page"},{"location":"examples/custom_macros/","page":"Custom Macros","title":"Custom Macros","text":"using Accessors: setmacro, lensmacro\n\nmacro myreset(ex)\n    setmacro(Lens!, ex)\nend\n\nmacro mylens!(ex)\n    lensmacro(Lens!, ex)\nend\n\no = M(1,2)\n@myreset o.a = :hi\n@myreset o.b += 98\n@test o.a == :hi\n@test o.b == 100\n\ndeep = [[[[1]]]]\n@myreset deep[1][1][1][1] = 2\n@test deep[1][1][1][1] === 2\n\nl = @mylens! _.foo[1]\no = (foo=[1,2,3], bar=:bar)\nset(o, l, 100)\n@test o == (foo=[100,2,3], bar=:bar)","category":"page"},{"location":"examples/custom_macros/","page":"Custom Macros","title":"Custom Macros","text":"Everything works, we can do arbitrary nesting and also use += syntax etc.","category":"page"},{"location":"examples/custom_macros/","page":"Custom Macros","title":"Custom Macros","text":"","category":"page"},{"location":"examples/custom_macros/","page":"Custom Macros","title":"Custom Macros","text":"This page was generated using Literate.jl.","category":"page"},{"location":"intro/#Usage","page":"Introduction","title":"Usage","text":"","category":"section"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"Say we have a deeply nested struct:","category":"page"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"julia> using StaticArrays;\n\njulia> struct Person\n           name::Symbol\n           age::Int\n       end;\n\njulia> struct SpaceShip\n           captain::Person\n           velocity::SVector{3, Float64}\n           position::SVector{3, Float64}\n       end;\n\njulia> s = SpaceShip(Person(:julia, 2009), [0.0, 0.0, 0.0], [0.0, 0.0, 0.0])\nSpaceShip(Person(:julia, 2009), [0.0, 0.0, 0.0], [0.0, 0.0, 0.0])","category":"page"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"Lets update the captains name:","category":"page"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"julia> s.captain.name = :JULIA\nERROR: type Person is immutable","category":"page"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"It's a bit cryptic but what it means that Julia tried very hard to set the field but gave it up since the struct is immutable.  So we have to do:","category":"page"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"julia> SpaceShip(Person(:JULIA, s.captain.age), s.velocity, s.position)\nSpaceShip(Person(:JULIA, 2009), [0.0, 0.0, 0.0], [0.0, 0.0, 0.0])","category":"page"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"This is messy and things get worse, if the structs are bigger. Accessorss to the rescue!","category":"page"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"julia> using Accessors\n\njulia> s = @set s.captain.name = :JULIA\nSpaceShip(Person(:JULIA, 2009), [0.0, 0.0, 0.0], [0.0, 0.0, 0.0])\n\njulia> s = @set s.velocity[1] += 999999\nSpaceShip(Person(:JULIA, 2009), [999999.0, 0.0, 0.0], [0.0, 0.0, 0.0])\n\njulia> s = @set s.velocity[1] += 1000001\nSpaceShip(Person(:JULIA, 2009), [2.0e6, 0.0, 0.0], [0.0, 0.0, 0.0])\n\njulia> @set s.position[2] = 20\nSpaceShip(Person(:JULIA, 2009), [2.0e6, 0.0, 0.0], [0.0, 20.0, 0.0])","category":"page"},{"location":"intro/#Under-the-hood","page":"Introduction","title":"Under the hood","text":"","category":"section"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"Under the hood this package implements a simple lens api. This api may be useful in its own right and works as follows:","category":"page"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"julia> using Accessors\n\njulia> l = @lens _.a.b\n(@lens _.b) ∘ (@lens _.a)\n\njulia> struct AB;a;b;end\n\njulia> obj = AB(AB(1,2),3)\nAB(AB(1, 2), 3)\n\njulia> set(obj, l, 42)\nAB(AB(1, 42), 3)\n\njulia> obj\nAB(AB(1, 2), 3)\n\njulia> l(obj)\n2\n\njulia> modify(x->10x, obj, l)\nAB(AB(1, 20), 3)","category":"page"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"Now the @set macro simply provides sugar for creating a lens and applying it. For instance","category":"page"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"@set obj.a.b = 42","category":"page"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"expands roughly to","category":"page"},{"location":"intro/","page":"Introduction","title":"Introduction","text":"l = @lens _.a.b\nset(obj, l, 42)","category":"page"},{"location":"lenses/#Lenses","page":"Lenses","title":"Lenses","text":"","category":"section"},{"location":"lenses/","page":"Lenses","title":"Lenses","text":"Accessors.jl is build around so called lenses. A Lens allows to access or replace deeply nested parts of complicated objects.","category":"page"},{"location":"lenses/#Example","page":"Lenses","title":"Example","text":"","category":"section"},{"location":"lenses/","page":"Lenses","title":"Lenses","text":"julia> using Accessors\n\njulia> struct T;a;b; end\n\njulia> obj = T(\"AA\", \"BB\");\n\njulia> lens = @lens _.a\n(@lens _.a)\n\njulia> lens(obj)\n\"AA\"\n\njulia> set(obj, lens, 2)\nT(2, \"BB\")\n\njulia> obj # the object was not mutated, instead an updated copy was created\nT(\"AA\", \"BB\")\n\njulia> modify(lowercase, obj, lens)\nT(\"aa\", \"BB\")","category":"page"},{"location":"lenses/#Interface","page":"Lenses","title":"Interface","text":"","category":"section"},{"location":"lenses/","page":"Lenses","title":"Lenses","text":"Implementing lenses is straight forward. They can be of any type and just need to implement the following interface:","category":"page"},{"location":"lenses/","page":"Lenses","title":"Lenses","text":"Accessors.set(obj, lens, val)\nlens(obj)","category":"page"},{"location":"lenses/","page":"Lenses","title":"Lenses","text":"These must be pure functions, that satisfy the three lens laws:","category":"page"},{"location":"lenses/","page":"Lenses","title":"Lenses","text":"@assert lens(set(obj, lens, val)) ≅ val\n        # You get what you set.\n@assert set(obj, lens, lens(obj)) ≅ obj\n        # Setting what was already there changes nothing.\n@assert set(set(obj, lens, val1), lens, val2) ≅ set(obj, lens, val2)\n        # The last set wins.","category":"page"},{"location":"lenses/","page":"Lenses","title":"Lenses","text":"Here ≅ is an appropriate notion of equality or an approximation of it. In most contexts this is simply ==. But in some contexts it might be ===, ≈, isequal or something else instead. For instance == does not work in Float64 context, because get(set(obj, lens, NaN), lens) == NaN can never hold. Instead isequal or ≅(x::Float64, y::Float64) = isequal(x,y) | x ≈ y are possible alternatives.","category":"page"},{"location":"lenses/","page":"Lenses","title":"Lenses","text":"See also @lens, set, modify.","category":"page"},{"location":"#Docstrings","page":"Docstrings","title":"Docstrings","text":"","category":"section"},{"location":"","page":"Docstrings","title":"Docstrings","text":"Modules = [Accessors]\nPrivate = false","category":"page"},{"location":"#Accessors.modify","page":"Docstrings","title":"Accessors.modify","text":"modify(f, obj, lens)\n\nReplace a deeply nested part x of obj by f(x).\n\njulia> using Accessors\n\njulia> obj = (a=1, b=2); lens=@lens _.a; f = x -> \"hello $x\";\n\njulia> modify(f, obj, lens)\n(a = \"hello 1\", b = 2)\n\nSee also set.\n\n\n\n\n\n","category":"function"},{"location":"#Accessors.set","page":"Docstrings","title":"Accessors.set","text":"set(lens, obj, val)\n\nReplace a deeply nested part of obj by val.\n\njulia> using Accessors\n\njulia> obj = (a=1, b=2); lens=@lens _.a; val = 100;\n\njulia> set(obj, lens, val)\n(a = 100, b = 2)\n\nSee also modify.\n\n\n\n\n\n","category":"function"},{"location":"#Accessors.@lens-Tuple{Any}","page":"Docstrings","title":"Accessors.@lens","text":"@lens\n\nConstruct a lens from a field access.\n\nExample\n\njulia> using Accessors\n\njulia> struct T;a;b;end\n\njulia> t = T(\"A1\", T(T(\"A3\", \"B3\"), \"B2\"))\nT(\"A1\", T(T(\"A3\", \"B3\"), \"B2\"))\n\njulia> l = @lens _.b.a.b\n(@lens _.b) ∘ (@lens _.a) ∘ (@lens _.b)\n\njulia> l(t)\n\"B3\"\n\njulia> set(t, l, 100)\nT(\"A1\", T(T(\"A3\", 100), \"B2\"))\n\njulia> t = (\"one\", \"two\")\n(\"one\", \"two\")\n\njulia> set(t, (@lens _[1]), \"1\")\n(\"1\", \"two\")\n\nSee also @set.\n\n\n\n\n\n","category":"macro"},{"location":"#Accessors.@reset-Tuple{Any}","page":"Docstrings","title":"Accessors.@reset","text":"@reset assignment\n\nShortcut for obj = @set obj....\n\nExample\n\njulia> using Accessors\n\njulia> t = (a=1,)\n(a = 1,)\n\njulia> @reset t.a=2\n(a = 2,)\n\njulia> t\n(a = 2,)\n\nSupports the same syntax as @lens. See also @set.\n\n\n\n\n\n","category":"macro"},{"location":"#Accessors.@set-Tuple{Any}","page":"Docstrings","title":"Accessors.@set","text":"@set assignment\n\nReturn a modified copy of deeply nested objects.\n\nExample\n\njulia> using Accessors\n\njulia> struct T;a;b end\n\njulia> t = T(1,2)\nT(1, 2)\n\njulia> @set t.a = 5\nT(5, 2)\n\njulia> t\nT(1, 2)\n\njulia> t = @set t.a = T(2,2)\nT(T(2, 2), 2)\n\njulia> @set t.a.b = 3\nT(T(2, 3), 2)\n\nSupports the same syntax as @lens. See also @reset.\n\n\n\n\n\n","category":"macro"},{"location":"internals/#Internals","page":"Internals","title":"Internals","text":"","category":"section"},{"location":"internals/","page":"Internals","title":"Internals","text":"Modules = [Accessors]\nPublic = false","category":"page"},{"location":"internals/#Accessors.lenscompose-Tuple{}","page":"Internals","title":"Accessors.lenscompose","text":"lenscompose([lens₁, [lens₂, [lens₃, ...]]])\n\nCompose lens₁, lens₂ etc. There is one subtle point here: While the two composition orders (lens₁ ⨟ lens₂) ⨟ lens₃ and lens₁ ⨟ (lens₂ ⨟ lens₃) have equivalent semantics, their performance may not be the same.\n\nThe lenscompose function tries to use a composition order, that the compiler likes. The composition order is therefore not part of the stable API.\n\n\n\n\n\n","category":"method"},{"location":"internals/#Accessors.lensmacro-Tuple{Any, Any}","page":"Internals","title":"Accessors.lensmacro","text":"lensmacro(lenstransform, ex::Expr)\n\nThis function can be used to create a customized variant of @lens. It works by applying lenstransform to the created lens at runtime.\n\n# new_lens = mytransform(lens)\nmacro mylens(ex)\n    lensmacro(mytransform, ex)\nend\n\nSee also setmacro.\n\n\n\n\n\n","category":"method"},{"location":"internals/#Accessors.setmacro-Tuple{Any, Expr}","page":"Internals","title":"Accessors.setmacro","text":"setmacro(lenstransform, ex::Expr; overwrite::Bool=false)\n\nThis function can be used to create a customized variant of @set. It works by applying lenstransform to the lens that is used in the customized @set macro at runtime.\n\nfunction mytransform(lens::Lens)::Lens\n    ...\nend\nmacro myset(ex)\n    setmacro(mytransform, ex)\nend\n\nSee also lensmacro.\n\n\n\n\n\n","category":"method"}]
}