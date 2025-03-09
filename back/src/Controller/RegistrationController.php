<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RegistrationController extends AbstractController
{
    public function __construct(
        private JWTTokenManagerInterface $jwtManager
    ) {}

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);
            if (!isset($data['email']) || !isset($data['password'])) {
                return $this->json([
                    'message' => 'Email and password are required'
                ], Response::HTTP_BAD_REQUEST);
            }
            $email = $data['email'];
            $username = explode('@', $data['email'])[0];
            $existingUser = $entityManager->getRepository(User::class)->findOneBy([
                'username' => $username
            ]);
            if ($existingUser) {
                return $this->json([
                    'message' => 'This email is already registered'
                ], Response::HTTP_CONFLICT);
            }
            $user = new User();
            $user->setUsername($username);
            $user->setEmail($email);
            $user->setPassword($passwordHasher->hashPassword($user, $data['password']));
            $violations = $validator->validate($user);
            if (isset($violations) && $violations->count() > 0) {
                $errors = [];
                foreach ($violations as $violation) {
                    $errors[] = $violation->getMessage();
                }
                return $this->json([
                    'message' => 'Validation failed',
                    'errors' => $errors
                ], Response::HTTP_BAD_REQUEST);
            
            }
            $entityManager->persist($user);
            $entityManager->flush();
            $token = $this->jwtManager->create($user);
            return $this->json([
                'token' => $token,
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'email' => $user->getEmail()
                ]
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'An error occurred during registration: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
