module drug_degradation_module
  implicit none
  real, parameter :: R = 8.314 ! Gas constant (J/mol/K)
contains

  ! Compute degradation rate constant k (per hour) 
  real function compute_k(A, Ea, T, H)
    real, intent(in) :: A, Ea, T, H
    real :: humidity_factor
    ! Simple linear humidity effect: increases k if H > 60%
    if (H > 60.0) then
        humidity_factor = 1.0 + 0.01*(H - 60.0)  ! adjust factor as needed
    else
        humidity_factor = 1.0
    end if
    compute_k = A * exp(-Ea / (R * (T + 273.15))) * humidity_factor
  end function compute_k

  ! Simulate drug stability over variable time and conditions
  subroutine simulate_stability_profile(C0, A, Ea, time_points, T_profile, H_profile, result)
    real, intent(in) :: C0, A, Ea
    real, intent(in) :: time_points(:)
    real, intent(in) :: T_profile(:)
    real, intent(in) :: H_profile(:)
    real, intent(out) :: result(size(time_points))
    integer :: i
    real :: k, C_prev, delta_t

    C_prev = C0
    result(1) = C_prev

    do i = 2, size(time_points)
        delta_t = time_points(i) - time_points(i-1)  ! hours
        k = compute_k(A, Ea, T_profile(i), H_profile(i))
        result(i) = C_prev * exp(-k * delta_t)
        C_prev = result(i)
    end do
  end subroutine simulate_stability_profile

end module drug_degradation_module
